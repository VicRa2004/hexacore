export abstract class ValueObject<T> {
  public readonly value: T;

  constructor(value: T) {
    // Congelamos el objeto para garantizar inmutabilidad
    this.value = Object.freeze(value);
  }

  public equals(other?: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    // Una forma simple y pragmática de comparar valores por estructura
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}
