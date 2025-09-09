import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { LanguageProvider } from '../../contexts/LanguageContext';

describe('LanguageSelector - Tests Simplifiés', () => {
  it('devrait afficher le sélecteur de langue', () => {
    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷 Français')).toBeInTheDocument();
  });

  it('devrait afficher la version mobile (icône seulement)', () => {
    // Mock de la taille d'écran mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    });

    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
  });

  it('devrait appliquer les classes CSS correctes', () => {
    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });
});
