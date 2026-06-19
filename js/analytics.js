/* Privacy-friendly analytics loader (GoatCounter - no cookies, no consent banner
   needed, GDPR-friendly). Disabled until configured: sign up free at
   https://www.goatcounter.com/, then set CODE below to the site code you pick.
   Until then this is a no-op and makes zero network requests. */
(function () {
  "use strict";
  var CODE = "luthrag"; // GoatCounter site code
  if (!CODE || CODE === "YOURCODE") return;
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "//gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + CODE + ".goatcounter.com/count");
  document.head.appendChild(s);
})();
