// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Make Jest globals available
import "jest-environment-jsdom";

jest.mock("firebase/app", () => ({
  initializeApp: () => ({}),
}));

jest.mock("firebase/auth", () => ({
  getAuth: () => ({}),
  GoogleAuthProvider: function () {},
  signInWithEmailAndPassword: () => Promise.resolve({}),
  setPersistence: () => Promise.resolve(),
  browserLocalPersistence: {},
}));

jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");
  return {
    ...actual,
    getFirestore: () => ({}),
    initializeFirestore: () => ({}),
    persistentLocalCache: () => ({}),
  };
});

jest.mock("firebase/messaging", () => ({
  getMessaging: () => ({}),
  isSupported: () => Promise.resolve(false),
}));
