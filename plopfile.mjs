/**
 * Project scaffolding CLI. Run `pnpm scaffold` and pick a generator.
 * @param {import('plop').NodePlopAPI} plop
 */
export default function (plop) {
  plop.setGenerator('component', {
    description: 'A React component in apps/web/src/components',
    prompts: [{ type: 'input', name: 'name', message: 'Component name (PascalCase):' }],
    actions: [
      {
        type: 'add',
        path: 'apps/web/src/components/{{pascalCase name}}.tsx',
        templateFile: 'tooling/plop-templates/component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'apps/web/src/components/{{pascalCase name}}.test.tsx',
        templateFile: 'tooling/plop-templates/component.test.tsx.hbs',
      },
    ],
  });

  plop.setGenerator('page', {
    description: 'A routed page in apps/web/src/pages (remember to add the <Route> in App.tsx)',
    prompts: [
      { type: 'input', name: 'name', message: 'Page name without "Page" suffix (PascalCase):' },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/web/src/pages/{{pascalCase name}}Page.tsx',
        templateFile: 'tooling/plop-templates/page.tsx.hbs',
      },
    ],
  });
}
