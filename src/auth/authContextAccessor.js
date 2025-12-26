let authContextInstance = null;

export function setAuthContextInstance(instance) {
  authContextInstance = instance;
}

export function getAuthContext() {
  return authContextInstance;
}
