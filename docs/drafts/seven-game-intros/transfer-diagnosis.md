# Transfer diagnosis, no new attempt

Read-only inspection on 2026-10-11: `/etc/codex/network-policy.json` declares `http_network_policy.type=restricted`, explicit HTTP egress host rules, and empty TCP domain/IP lists. `/etc/environment` configures the runtime proxy and its CA.

All returned Library download hosts fall outside the HTTP egress list: `sdmntprwestus3.oaiusercontent.com`, `sdmntprwestus.oaiusercontent.com`, `sdmntprsouthcentralus.oaiusercontent.com`. There is no `oaiusercontent.com` host or wildcard entry in the published policy. Existing helper stderr contains only `library file transfer failed: download failed` (exit 1), so it does not independently reveal HTTP status. The policy mismatch explains a blocked transfer; it is not a missing author input, missing backing ID, or a reason to change security settings.

Official exposed Library ingress is prepare_materialize; it can return a workspace_path when supported. Both calls here returned workspace_path=null for every image and a signed transfer route instead. No separate official file-ingress capability into this executor was exposed in tool discovery or repository runtime documentation. Parent holds original bytes and inspected images. No new network request, allowlist change, alternate URL/account or owner re-upload request made.

Independent editorial/render/published-filter tests rerun: 3 files, 15 tests PASS. Actual game draft routes remain 404.
