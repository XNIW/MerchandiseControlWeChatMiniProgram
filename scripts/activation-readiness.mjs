const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha = /^[0-9a-f]{40}$/;
const hash = /^[0-9a-f]{64}$/;
const deny = () => {
  throw new Error("READONLY_READINESS_REQUIRED");
};
const evidence = (value) =>
  typeof value === "string" &&
  value.trim().length >= 8 &&
  !/TODO|PLACEHOLDER|NOT_RUN|NON_VERIFICATO/i.test(value);
function exact(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !keys.includes(k)) ||
    keys.some((k) => !(k in value))
  )
    deny();
}
function ids(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 100 &&
    value.every((id) => typeof id === "string" && uuid.test(id)) &&
    new Set(value).size === value.length
  );
}
function sameIds(a, b) {
  return ids(a) && ids(b) && a.length === b.length && a.every((id) => b.includes(id));
}

export function validateReadiness(record, context) {
  if (record?.schemaVersion === 1) return validateLegacy(record, context);
  exact(record, [
    "schemaVersion",
    "phase",
    "protocol",
    "review",
    "reviewEvidence",
    "credential",
    "credentialEvidence",
    "testAccount",
    "testAccountEvidence",
    "testExchange",
    "testExchangeEvidence",
    "enrollment",
    "enrollmentEvidence",
    "domainValidation",
    "privacy",
    "miniSha",
    "adminSha",
    "workerVersion",
    "appId",
    "validUntil",
    "testerProfileIds",
    "shopIds",
    "admissionEvidence",
    "upstreamTracingDisabled",
  ]);
  if (
    record.schemaVersion !== 2 ||
    !["enrollment", "readonly"].includes(record.phase) ||
    record.phase !== context.phase ||
    record.protocol !== "wechat-mini-code2session-v1" ||
    record.protocol !== context.protocol ||
    record.review !== "APPROVED" ||
    !evidence(record.reviewEvidence) ||
    record.testAccount !== true ||
    !evidence(record.testAccountEvidence) ||
    record.domainValidation !== true ||
    record.upstreamTracingDisabled !== true ||
    context.upstreamTracingDisabled !== true ||
    !evidence(record.credentialEvidence) ||
    !evidence(record.admissionEvidence) ||
    !sha.test(record.miniSha) ||
    record.miniSha !== context.miniSha ||
    !sha.test(record.adminSha) ||
    record.adminSha !== context.adminSha ||
    !uuid.test(record.workerVersion) ||
    record.workerVersion !== context.workerVersion ||
    !/^wx[0-9a-f]{16}$/.test(record.appId) ||
    record.appId !== context.appId ||
    !Number.isSafeInteger(record.validUntil) ||
    record.validUntil <= context.now ||
    record.validUntil > context.now + 86400 ||
    !sameIds(record.testerProfileIds, context.testerProfileIds) ||
    !sameIds(record.shopIds, context.shopIds)
  )
    deny();
  if (record.privacy?.mode === "native") {
    exact(record.privacy, ["mode", "contentVersion", "contentSha256", "runtime", "evidence"]);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(record.privacy.contentVersion) ||
      record.privacy.contentVersion !== context.privacyContentVersion ||
      !hash.test(record.privacy.contentSha256) ||
      record.privacy.contentSha256 !== context.privacyContentSha256 ||
      record.privacy.runtime !== "PASS" ||
      !evidence(record.privacy.evidence)
    )
      deny();
  } else if (record.privacy?.mode === "h5") {
    exact(record.privacy, ["mode", "webView", "businessDomainVerified", "evidence"]);
    if (
      record.privacy.webView !== "PASS" ||
      record.privacy.businessDomainVerified !== true ||
      !evidence(record.privacy.evidence)
    )
      deny();
  } else deny();
  const status = context.status;
  if (
    status?.linkingEnabled !== false ||
    status.miniCatalogMutationsEnabled !== false ||
    ["web", "android", "ios"].some((name) => status.enabledSurfaces?.[name] !== false) ||
    status.miniProtocol !== record.protocol
  )
    deny();
  if (record.phase === "enrollment") {
    // A real TEST exchange is the result of enrollment verification, not a
    // fabricated prerequisite. This gate enables pairing only, never business.
    if (
      record.protocol !== "wechat-mini-code2session-v1" ||
      record.credential !== "REPLACED_SERVER_ONLY" ||
      record.testExchange !== "NOT_RUN" ||
      record.testExchangeEvidence !== null ||
      record.enrollment !== "NOT_RUN" ||
      record.enrollmentEvidence !== null ||
      status.enabledSurfaces?.mini_program !== false ||
      status.miniEnrollmentReady !== true
    )
      deny();
  } else if (
    record.credential !== "REPLACED_AND_VERIFIED" ||
    record.testExchange !== "PASS" ||
    !evidence(record.testExchangeEvidence) ||
    record.enrollment !== "PASS" ||
    !evidence(record.enrollmentEvidence) ||
    status.activation !== "ready" ||
    status.readySurfaces?.mini_program !== true ||
    status.enabledSurfaces?.mini_program !== true ||
    (record.protocol === "wechat-mini-code2session-v1" && status.miniProvider !== "wechat-mini")
  )
    deny();
}

// V1 remains exactly the OIDC + qualified H5 contract. V2 fields cannot be
// smuggled into a legacy attestation. V2 is required for direct/native evidence.
function validateLegacy(record, context) {
  if (
    context.protocol !== "mini-id-token-nonce-v1" ||
    context.phase !== "readonly" ||
    !sameIds(record.testerProfileIds, context.testerProfileIds) ||
    !sameIds(record.shopIds, context.shopIds)
  )
    deny();
  exact(record, [
    "schemaVersion",
    "protocol",
    "review",
    "credential",
    "provider",
    "testAccount",
    "domainValidation",
    "privacyWebView",
    "miniSha",
    "adminSha",
    "workerVersion",
    "appId",
    "validUntil",
    "testerProfileIds",
    "shopIds",
    "reviewEvidence",
    "credentialEvidence",
    "providerEvidence",
    "admissionEvidence",
  ]);
  if (
    record.protocol !== "mini-id-token-nonce-v1" ||
    record.review !== "APPROVED" ||
    record.credential !== "ROTATED_AND_VERIFIED" ||
    record.provider !== "QUALIFIED" ||
    record.testAccount !== true ||
    record.domainValidation !== true ||
    record.privacyWebView !== "PASS" ||
    !sha.test(record.miniSha) ||
    record.miniSha !== context.miniSha ||
    !sha.test(record.adminSha) ||
    record.adminSha !== context.adminSha ||
    !uuid.test(record.workerVersion) ||
    record.workerVersion !== context.workerVersion ||
    record.appId !== context.appId ||
    !/^wx[0-9a-f]{16}$/.test(record.appId) ||
    !Number.isSafeInteger(record.validUntil) ||
    record.validUntil <= context.now ||
    record.validUntil > context.now + 86400 ||
    !ids(record.testerProfileIds) ||
    !ids(record.shopIds) ||
    ["reviewEvidence", "credentialEvidence", "providerEvidence", "admissionEvidence"].some(
      (k) => !evidence(record[k]),
    )
  )
    deny();
  const status = context.status;
  if (
    status?.activation !== "ready" ||
    status.provider !== "custom:wechat" ||
    status.linkingEnabled !== false ||
    status.miniCatalogMutationsEnabled !== false ||
    status.readySurfaces?.mini_program !== true ||
    status.enabledSurfaces?.mini_program !== true ||
    ["web", "android", "ios"].some((name) => status.enabledSurfaces?.[name] !== false) ||
    (status.miniProtocol !== undefined && status.miniProtocol !== record.protocol)
  )
    deny();
}
