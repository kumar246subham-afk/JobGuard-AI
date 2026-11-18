import re
from urllib.parse import urlparse
from typing import Dict, Any, Optional

# List of common suspicious or disposable TLDs / free subdomains often exploited in employment scams
SUSPICIOUS_TLDS = {".top", ".xyz", ".work", ".click", ".buzz", ".guru", ".cfd", ".sbs"}
FREE_HOSTING_SUBDOMAINS = ["blogspot.com", "wordpress.com", "weebly.com", "wixsite.com", "sites.google.com"]

def analyze_url_safely(url_str: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Safely inspects URL structure without making any outbound HTTP connections (prevents SSRF).
    Analyzes hostname, domain TLD, IP literals, and returns educational trust flags.
    """
    if not url_str or not url_str.strip():
        return None

    url_str = url_str.strip()
    # Normalize scheme if missing
    if not url_str.startswith(("http://", "https://")):
        test_url = "https://" + url_str
    else:
        test_url = url_str

    try:
        parsed = urlparse(test_url)
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return {
                "provided_url": url_str,
                "is_valid": False,
                "domain": None,
                "warning": "Malformed URL address provided."
            }

        # Check for private IP literals / localhost (SSRF protection & anti-obfuscation)
        ip_pattern = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")
        is_ip_literal = bool(ip_pattern.match(hostname))
        
        is_private_ip = False
        if is_ip_literal:
            parts = [int(p) for p in hostname.split(".")]
            if parts[0] == 10 or (parts[0] == 172 and 16 <= parts[1] <= 31) or (parts[0] == 192 and parts[1] == 168) or parts[0] == 127:
                is_private_ip = True

        # Check suspicious TLDs
        has_suspicious_tld = any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS)
        is_free_hosting = any(hostname.endswith(fh) for fh in FREE_HOSTING_SUBDOMAINS)

        flags = []
        if is_private_ip or hostname in ("localhost", "127.0.0.1", "::1"):
            flags.append("Points to local/private internal address (high risk/invalid for public company).")
        if is_ip_literal:
            flags.append("Host is a direct raw numeric IP instead of a registered corporate domain name.")
        if is_free_hosting:
            flags.append("Hosted on free site builder / blog platform rather than a standalone corporate domain.")
        if has_suspicious_tld:
            flags.append("Uses low-reputation or disposable top-level domain frequently associated with short-lived scams.")
        if parsed.scheme == "http":
            flags.append("Uses unencrypted HTTP connection instead of secure HTTPS.")

        return {
            "provided_url": url_str,
            "is_valid": True,
            "domain": hostname,
            "scheme": parsed.scheme,
            "is_secure_https": parsed.scheme == "https",
            "is_ip_literal": is_ip_literal,
            "flags": flags,
            "note": "Domain evaluation is purely syntactic. Legitimate-looking domains can be spoofed or compromised. Outbound fetching is disabled for security."
        }
    except Exception as e:
        return {
            "provided_url": url_str,
            "is_valid": False,
            "domain": None,
            "warning": f"URL parsing error: {str(e)}"
        }
