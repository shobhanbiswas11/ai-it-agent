import { injectable } from "tsyringe";

export interface TimeRangeProps {
  start: Date;
  end: Date;
}

@injectable()
export class TimeRange {
  private props: TimeRangeProps;

  constructor(props: TimeRangeProps) {
    this.props = props;
    this.validate();
  }

  private validate(): void {
    if (!this.props.start) {
      throw new Error("Start time is required");
    }
    if (!this.props.end) {
      throw new Error("End time is required");
    }
    if (this.props.start >= this.props.end) {
      throw new Error("Start time must be before end time");
    }
  }

  get start(): Date {
    return this.props.start;
  }

  get end(): Date {
    return this.props.end;
  }

  get durationMs(): number {
    return this.props.end.getTime() - this.props.start.getTime();
  }

  get durationSeconds(): number {
    return Math.floor(this.durationMs / 1000);
  }

  get durationMinutes(): number {
    return Math.floor(this.durationSeconds / 60);
  }

  get durationHours(): number {
    return Math.floor(this.durationMinutes / 60);
  }

  contains(date: Date): boolean {
    return date >= this.props.start && date <= this.props.end;
  }

  overlaps(other: TimeRange): boolean {
    return (
      this.props.start < other.props.end && this.props.end > other.props.start
    );
  }

  equals(other: TimeRange): boolean {
    return (
      this.props.start.getTime() === other.props.start.getTime() &&
      this.props.end.getTime() === other.props.end.getTime()
    );
  }

  toJSON(): TimeRangeProps {
    return { ...this.props };
  }

  static create(start: Date, end: Date): TimeRange {
    return new TimeRange({ start, end });
  }

  static fromDuration(start: Date, durationMs: number): TimeRange {
    return new TimeRange({
      start,
      end: new Date(start.getTime() + durationMs),
    });
  }

  static lastHour(): TimeRange {
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    return new TimeRange({ start, end });
  }

  static lastDay(): TimeRange {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return new TimeRange({ start, end });
  }

  static lastWeek(): TimeRange {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new TimeRange({ start, end });
  }
}
