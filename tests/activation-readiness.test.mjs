import assert from "node:assert/strict";
import test from "node:test";
import {
  validateReadiness,
  validateTestCredentialAuthorization,
} from "../scripts/activation-readiness.mjs";

const id = "00000000-0000-4000-8000-000000000010";
const record = {
  schemaVersion: 2,
  phase: "readonly",
  protocol: "wechat-mini-code2session-v1",
  review: "APPROVED",
  reviewEvidence: "isolated-review-fixture",
  credential: "REPLACED_AND_VERIFIED",
  credentialEvidence: "isolated-credential-fixture",
  testAccount: true,
  testAccountEvidence: "isolated-test-account-fixture",
  testExchange: "PASS",
  testExchangeEvidence: "isolated-exchange-fixture",
  enrollment: "PASS",
  enrollmentEvidence: "isolated-pairing-fixture",
  domainValidation: true,
  privacy: {
    mode: "native",
    contentVersion: "2026-08-14",
    contentSha256: "c".repeat(64),
    runtime: "PASS",
    evidence: "isolated-native-fixture",
  },
  miniSha: "a".repeat(40),
  adminSha: "b".repeat(40),
  workerVersion: id,
  appId: "wx0000000000000001",
  validUntil: 2000,
  testerProfileIds: [id],
  shopIds: [id],
  admissionEvidence: "isolated-admission-fixture",
  upstreamTracingDisabled: true,
};
const context = {
  ...record,
  now: 1000,
  privacyContentVersion: record.privacy.contentVersion,
  privacyContentSha256: record.privacy.contentSha256,
  status: {
    activation: "ready",
    linkingEnabled: false,
    miniCatalogMutationsEnabled: false,
    miniProtocol: record.protocol,
    miniProvider: "wechat-mini",
    readySurfaces: { mini_program: true },
    enabledSurfaces: { mini_program: true, web: false, android: false, ios: false },
  },
};
const testAuthorization = {
  kind: "EXPOSED_TEST_CREDENTIAL_EXCEPTION",
  userAuthorized: true,
  mandateSha256: "e".repeat(64),
  authorizedAt: 900,
  appId: record.appId,
  testerProfileIds: [id],
  shopIds: [id],
  gatewayOrigin:
    "https://merchandise-control-admin-web-staging.merchandise-control-admin-web.workers.dev",
  workerName: "merchandise-control-admin-web-staging",
  supabaseProjectRef: "jpgoimipbothfgkokyvm",
  credentialState: "EXISTING_PREVIOUSLY_EXPOSED",
  rotation: "NOT_PERFORMED",
  residualRisk: "ACCEPTED_FOR_TEST_ONLY",
};
const exceptionContext = {
  ...context,
  gatewayOrigin: testAuthorization.gatewayOrigin,
  workerName: testAuthorization.workerName,
  supabaseProjectRef: testAuthorization.supabaseProjectRef,
  testCredentialMandateSha256: testAuthorization.mandateSha256,
  testCredentialAuthorization: testAuthorization,
};
test("explicit TEST exception starts enrollment without fabricating rotation or exchange", () => {
  const initial = {
    ...record,
    phase: "enrollment",
    credential: "EXPOSED_TEST_AUTHORIZED_SERVER_ONLY",
    testExchange: "NOT_RUN",
    testExchangeEvidence: null,
    enrollment: "NOT_RUN",
    enrollmentEvidence: null,
  };
  const initialContext = {
    ...exceptionContext,
    phase: "enrollment",
    status: {
      ...context.status,
      miniEnrollmentReady: true,
      enabledSurfaces: { ...context.status.enabledSurfaces, mini_program: false },
    },
  };
  assert.doesNotThrow(() => validateReadiness(initial, initialContext));
  assert.equal(initial.credential, "EXPOSED_TEST_AUTHORIZED_SERVER_ONLY");
  assert.equal(initial.testExchange, "NOT_RUN");
  assert.equal(testAuthorization.rotation, "NOT_PERFORMED");
  assert.throws(() =>
    validateReadiness(initial, { ...initialContext, testCredentialAuthorization: undefined }),
  );
  assert.throws(() =>
    validateReadiness(
      { ...initial, credential: "EXPOSED_TEST_AUTHORIZED_AND_VERIFIED" },
      initialContext,
    ),
  );
  assert.throws(() => validateReadiness(initial, { ...initialContext, status: context.status }));
});
test("TEST exception cannot certify readonly before actual exchange and pairing", () => {
  const verified = { ...record, credential: "EXPOSED_TEST_AUTHORIZED_AND_VERIFIED" };
  assert.doesNotThrow(() => validateReadiness(verified, exceptionContext));
  for (const delta of [
    { credential: "EXPOSED_TEST_AUTHORIZED_SERVER_ONLY" },
    { testExchange: "NOT_RUN" },
    { testExchangeEvidence: null },
    { enrollment: "NOT_RUN" },
    { enrollmentEvidence: null },
    { protocol: "mini-id-token-nonce-v1" },
    { schemaVersion: 1 },
  ])
    assert.throws(() => validateReadiness({ ...verified, ...delta }, exceptionContext));
});
test("TEST exception fails closed on absent authority and any scope or risk mismatch", () => {
  assert.doesNotThrow(() =>
    validateTestCredentialAuthorization(testAuthorization, exceptionContext),
  );
  for (const delta of [
    { userAuthorized: false },
    { kind: "GENERAL_EXCEPTION" },
    { mandateSha256: "f".repeat(64) },
    { authorizedAt: 1001 },
    { appId: "wx0000000000000002" },
    { testerProfileIds: [] },
    { shopIds: [] },
    { shopIds: [id, id] },
    { testerProfileIds: ["00000000-0000-4000-8000-000000000011"] },
    { shopIds: ["00000000-0000-4000-8000-000000000011"] },
    { gatewayOrigin: "https://production.example.test" },
    { workerName: "merchandise-control-admin-web" },
    { supabaseProjectRef: "production" },
    { credentialState: "NEW" },
    { rotation: "ROTATED" },
    { residualRisk: "RESOLVED" },
    { extraApproval: true },
  ])
    assert.throws(() =>
      validateTestCredentialAuthorization({ ...testAuthorization, ...delta }, exceptionContext),
    );
  for (const delta of [
    { testCredentialMandateSha256: undefined },
    { gatewayOrigin: "https://production.example.test" },
    { workerName: "merchandise-control-admin-web" },
    { supabaseProjectRef: "production" },
    { protocol: "mini-id-token-nonce-v1" },
    { appId: "wx0000000000000002" },
    { testerProfileIds: [id, "00000000-0000-4000-8000-000000000011"] },
    { shopIds: [id, "00000000-0000-4000-8000-000000000011"] },
  ])
    assert.throws(() =>
      validateTestCredentialAuthorization(testAuthorization, { ...exceptionContext, ...delta }),
    );
});
test("native direct readiness requires current evidence, identity and protocol without mixed legacy claims", () => {
  assert.doesNotThrow(() => validateReadiness(record, context));
  for (const delta of [
    { schemaVersion: 1 },
    { schemaVersion: 3 },
    { privacyWebView: "PASS" },
    { provider: "QUALIFIED" },
    { protocol: "mini-id-token-nonce-v1" },
    { credential: "EXPOSED" },
    { testExchange: "NOT_RUN" },
    { enrollment: "NOT_RUN" },
    { upstreamTracingDisabled: false },
    { miniSha: "d".repeat(40) },
    { validUntil: 999 },
    { testerProfileIds: [] },
    { shopIds: [id, id] },
    { reviewEvidence: "NOT_RUN" },
    { phase: "enrollment" },
  ])
    assert.throws(() => validateReadiness({ ...record, ...delta }, context));
  for (const delta of [
    { mode: "h5" },
    { runtime: "NOT_RUN" },
    { contentSha256: "d".repeat(64) },
    { contentVersion: "2026-08-15" },
    { privacyWebView: "PASS" },
  ])
    assert.throws(() =>
      validateReadiness({ ...record, privacy: { ...record.privacy, ...delta } }, context),
    );
  assert.throws(() =>
    validateReadiness(record, { ...context, shopIds: ["00000000-0000-4000-8000-000000000011"] }),
  );
});
test("enrollment gate permits only pairing before actual TEST proof and never business ON", () => {
  const initial = {
    ...record,
    phase: "enrollment",
    credential: "REPLACED_SERVER_ONLY",
    testExchange: "NOT_RUN",
    testExchangeEvidence: null,
    enrollment: "NOT_RUN",
    enrollmentEvidence: null,
  };
  const initialContext = {
    ...context,
    phase: "enrollment",
    status: {
      ...context.status,
      activation: "disabled",
      readySurfaces: { mini_program: false },
      miniEnrollmentReady: true,
      enabledSurfaces: { ...context.status.enabledSurfaces, mini_program: false },
    },
  };
  assert.doesNotThrow(() => validateReadiness(initial, initialContext));
  assert.throws(() => validateReadiness(initial, { ...initialContext, status: context.status }));
  assert.throws(() => validateReadiness(record, initialContext));
});
test("V1 remains an exact legacy OIDC/H5 readonly attestation", () => {
  const legacy = {
    schemaVersion: 1,
    protocol: "mini-id-token-nonce-v1",
    review: "APPROVED",
    credential: "ROTATED_AND_VERIFIED",
    provider: "QUALIFIED",
    testAccount: true,
    domainValidation: true,
    privacyWebView: "PASS",
    miniSha: record.miniSha,
    adminSha: record.adminSha,
    workerVersion: id,
    appId: record.appId,
    validUntil: 2000,
    testerProfileIds: [id],
    shopIds: [id],
    reviewEvidence: "isolated-review",
    credentialEvidence: "isolated-credential",
    providerEvidence: "isolated-provider",
    admissionEvidence: "isolated-admission",
  };
  const oldContext = {
    ...context,
    protocol: legacy.protocol,
    status: { ...context.status, miniProtocol: legacy.protocol, provider: "custom:wechat" },
  };
  assert.doesNotThrow(() => validateReadiness(legacy, oldContext));
  for (const delta of [
    { protocol: record.protocol },
    { phase: "enrollment" },
    { testerProfileIds: [] },
    { shopIds: ["00000000-0000-4000-8000-000000000011"] },
  ])
    assert.throws(() => validateReadiness(legacy, { ...oldContext, ...delta }));
  assert.throws(() => validateReadiness({ ...legacy, privacy: record.privacy }, oldContext));
});
