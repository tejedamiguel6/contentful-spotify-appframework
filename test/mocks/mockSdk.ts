import { vi } from 'vitest';

const mockSdk: any = {
  app: {
    onConfigure: vi.fn(),
    getParameters: vi.fn().mockReturnValueOnce({}),
    setReady: vi.fn(),
    getCurrentState: vi.fn(),
  },
  ids: {
    app: 'test-app',
  },
  field: {
    id: 'unknown-field',
    getValue: vi.fn(),
    setValue: vi.fn(),
    onValueChanged: vi.fn(),
  },
  entry: {
    fields: {},
  },
};

export { mockSdk };
