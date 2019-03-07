export const UNKNOWN_EXPORT_MESSAGE = (text, module: string) =>
  `Nesd cannot export a component/module that is not a part of the currently processed module (${module}). Please verify whether each exported unit is available in this particular context.`;
export const INVALID_MODULE_MESSAGE = (text, scope: string) =>
  `Nesd cannot create the module instance. Often, this is because of a circular dependency between modules. Use forwardRef() to avoid it. (Read more https://docs.nestjs.com/fundamentals/circular-dependency.) Scope [${scope}]`
export const INVALID_CLASS_MESSAGE = (text, value: any) =>
  `ModuleRef cannot instantiate class (${value} is not constructable).`
