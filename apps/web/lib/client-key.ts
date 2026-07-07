// The programmatic API-key prefix — shared by the minting route (which
// generates `opsb_…` secrets) and the /api/v1 verifier (which keys off it to
// pick the credential path). Lives in its own dependency-light module so the
// minting route doesn't drag the whole auth stack in for one constant.
export const CLIENT_KEY_PREFIX = "opsb_";
