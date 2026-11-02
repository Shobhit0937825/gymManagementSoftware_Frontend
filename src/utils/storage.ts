export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`gym_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`gym_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

export const clearGymStorage = (): void => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('gym_')) {
      localStorage.removeItem(key);
    }
  });
};
