import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsDateRangeValid', async: false })
export class IsDateRangeValidConstraint
  implements ValidatorConstraintInterface
{
  validate(endDate: unknown, args: ValidationArguments): boolean {
    const object = args.object as {
      startDate?: string;
      endDate?: string;
    };

    if (!object.startDate || !object.endDate) {
      return true;
    }

    const start = new Date(object.startDate);
    const end = new Date(object.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return start <= end;
  }

  defaultMessage(): string {
    return 'startDate não pode ser posterior a endDate.';
  }
}

export function IsDateRangeValid(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string): void {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateRangeValidConstraint,
    });
  };
}