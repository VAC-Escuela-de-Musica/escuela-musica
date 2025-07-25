/**
 * Result pattern implementation
 * Provides a standardized way to handle success/error results
 */

class Result {
  constructor(success, data, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new Result(true, data);
  }

  static failure(error) {
    return new Result(false, null, error);
  }

  isSuccess() {
    return this.success;
  }

  isFailure() {
    return !this.success;
  }

  getData() {
    if (this.isFailure()) {
      throw new Error("Cannot get data from a failed result");
    }
    return this.data;
  }

  getError() {
    if (this.isSuccess()) {
      throw new Error("Cannot get error from a successful result");
    }
    return this.error;
  }

  map(fn) {
    if (this.isFailure()) {
      return this;
    }
    try {
      return Result.success(fn(this.data));
    } catch (error) {
      return Result.failure(error);
    }
  }

  flatMap(fn) {
    if (this.isFailure()) {
      return this;
    }
    try {
      return fn(this.data);
    } catch (error) {
      return Result.failure(error);
    }
  }

  fold(onSuccess, onFailure) {
    if (this.isSuccess()) {
      return onSuccess(this.data);
    } else {
      return onFailure(this.error);
    }
  }

  match(handlers) {
    const { success, failure } = handlers;
    return this.isSuccess() ? success(this.data) : failure(this.error);
  }

  async asyncMap(asyncFn) {
    if (this.isFailure()) {
      return this;
    }
    try {
      const result = await asyncFn(this.data);
      return Result.success(result);
    } catch (error) {
      return Result.failure(error);
    }
  }

  async asyncFlatMap(asyncFn) {
    if (this.isFailure()) {
      return this;
    }
    try {
      return await asyncFn(this.data);
    } catch (error) {
      return Result.failure(error);
    }
  }

  // Static helper methods
  static async fromPromise(promise) {
    try {
      const data = await promise;
      return Result.success(data);
    } catch (error) {
      return Result.failure(error);
    }
  }

  static fromTryCatch(fn) {
    try {
      const data = fn();
      return Result.success(data);
    } catch (error) {
      return Result.failure(error);
    }
  }

  static async fromAsyncTryCatch(asyncFn) {
    try {
      const data = await asyncFn();
      return Result.success(data);
    } catch (error) {
      return Result.failure(error);
    }
  }

  // Utility methods for collections
  static all(results) {
    const successes = [];
    for (const result of results) {
      if (result.isFailure()) {
        return result;
      }
      successes.push(result.getData());
    }
    return Result.success(successes);
  }

  static any(results) {
    const failures = [];
    for (const result of results) {
      if (result.isSuccess()) {
        return result;
      }
      failures.push(result.getError());
    }
    const errorMessage = `All operations failed: ${failures.map((e) => e.message).join(", ")}`;
    return Result.failure(new Error(errorMessage));
  }
}

export default Result; 