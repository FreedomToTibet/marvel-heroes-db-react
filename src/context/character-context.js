import React, { createContext } from 'react';

export const CharacterContext = createContext(null);

export const CharacterProvider = ({ children, onCharSelected }) => {
  return (
    <CharacterContext.Provider value={{ onCharSelected }}>
      {children}
    </CharacterContext.Provider>
  );
};