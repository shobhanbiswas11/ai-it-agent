import type { Mock, MockedFunction, MockedObject } from "vitest";

declare global {
  type Mocked<T> = MockedObject<T>;
  type MockedFn<T extends (...args: any[]) => any> = MockedFunction<T>;
  type MockFn = Mock;
}

export {};
