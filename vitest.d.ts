import { MockProxy, mock as vitestExtendedMock } from "vitest-mock-extended";

declare global {
  type Mocked<T> = MockProxy<T>;
  const mock: typeof vitestExtendedMock;
}

export {};
