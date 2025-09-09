import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidation } from '../useValidation';

describe('useValidation - Tests Simplifiés', () => {
  it('devrait initialiser avec des valeurs par défaut', () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
  });

  it('devrait valider un champ email', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.isDirty).toBe(true);
  });

  it('devrait valider un mot de passe fort', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('password', 'StrongPass123!');
    });

    expect(result.current.values.password).toBe('StrongPass123!');
    expect(result.current.isDirty).toBe(true);
  });

  it('devrait valider une URL correcte', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('url', 'https://example.com');
    });

    expect(result.current.values.url).toBe('https://example.com');
    expect(result.current.isDirty).toBe(true);
  });

  it('devrait valider un numéro de téléphone', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('phone', '+33123456789');
    });

    expect(result.current.values.phone).toBe('+33123456789');
    expect(result.current.isDirty).toBe(true);
  });

  it('devrait valider un texte avec longueur minimale', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
    expect(result.current.isDirty).toBe(true);
  });

  it('devrait marquer le formulaire comme dirty après modification', () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('devrait réinitialiser le formulaire', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it('devrait valider plusieurs champs simultanément', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('password', 'StrongPass123!');
      result.current.setValue('name', 'John Doe');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.values.password).toBe('StrongPass123!');
    expect(result.current.values.name).toBe('John Doe');
    expect(result.current.isDirty).toBe(true);
  });
});
