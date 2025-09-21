module.exports = {
  default: {
    require: [
      'ts-node/register',   // compilar TS
      'test/steps/**/*.ts'  // arquivos .steps.ts
    ],
    format: ['progress'],   // saída simples no console
    paths: ['test/features/**/*.feature'], // onde estão os .feature
    publishQuiet: true
  }
};
