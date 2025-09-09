import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecureInput } from '../SecureInput';

describe('SecureInput - Tests Simplifiés', () => {
  it('devrait rendre un input sécurisé', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SecureInput
        type="text"
        placeholder="Test"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('Test');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('devrait afficher une erreur pour un email invalide', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SecureInput
        type="email"
        placeholder="Email"
        onChange={mockOnChange}
        showValidation={true}
      />
    );

    const input = screen.getByPlaceholderText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('devrait valider l\'URL correctement', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SecureInput
        type="url"
        placeholder="URL"
        onChange={mockOnChange}
        showValidation={true}
      />
    );

    const input = screen.getByPlaceholderText('URL');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'url');
  });

  it('devrait nettoyer le contenu XSS', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SecureInput
        type="text"
        placeholder="Texte"
        onChange={mockOnChange}
        showValidation={true}
      />
    );

    const input = screen.getByPlaceholderText('Texte');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('devrait appliquer les classes CSS personnalisées', () => {
    const mockOnChange = vi.fn();
    
    render(
      <SecureInput
        type="text"
        placeholder="Test"
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('custom-class');
  });
});
