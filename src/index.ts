import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "playground-elements/playground-project.js";
import "playground-elements/playground-file-editor.js";
import "playground-elements/playground-preview.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import { PlaygroundProject } from "playground-elements/playground-project.js";
import { mdiAlert } from "@mdi/js";

function wrapPathInSvg(path: string): string {
  return `data:image/svg+xml;utf8,${wrapPathInSvgWithoutPrefix(path)}`;
}
export function wrapPathInSvgWithoutPrefix(path: string): string {
  return `<svg style='fill: currentColor' viewBox='0 0 24 24'><path d='${path}'></path></svg>`;
}

@customElement("playground-exercise")
export class PlaygroundExercise extends LitElement {
  @query("#project1")
  project!: PlaygroundProject;

  @state()
  syntaxError = false;

  @state()
  exportError = false;

  render() {
    return html`
      <playground-project
        id="project1"
        @compileStart=${() => {
          this.syntaxError = false;
          this.exportError = false;
        }}
        @compileDone=${() => {
          if (this.project.diagnostics) {
            const indexDiagnostics = this.project.diagnostics.get("index.ts");

            if (
              indexDiagnostics &&
              indexDiagnostics.find((d) => d.severity === 1)
            ) {
              this.syntaxError = true;
            }
            const testDiagnostics = this.project.diagnostics.get("test.ts");

            if (
              testDiagnostics &&
              testDiagnostics.find((d) => d.severity === 1)
            ) {
              this.exportError = true;
            }
          }
        }}
      >
        <slot></slot>

        <script type="sample/ts" filename="assert.ts">
          import 'chai/chai.js'
          export const assert = (window as any).chai.assert;
        </script>

        <script type="sample/ts" filename="test-result.ts">
          import '@shoelace-style/shoelace/dist/components/icon/icon.js';
          import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
          import { mdiAlert, mdiCheck } from '@mdi/js';
          import { LitElement, html } from 'lit';
          import { customElement, property } from 'lit/decorators.js';
          import { Task } from '@lit/task';

          function wrapPathInSvg(path: string): string {
            return \`data:image/svg+xml;utf8,\${wrapPathInSvgWithoutPrefix(path)}\`;
          }
          export function wrapPathInSvgWithoutPrefix(path: string): string {
            return \`<svg style='fill: currentColor' viewBox='0 0 24 24'><path d='\${path}'></path></svg>\`;
          }
          @customElement('test-result')
          export class TestResult extends LitElement {
            @property()
            testFunction: () => Promise<void> | undefined;

            _testTask = new Task(this,
              ([test]) => test ? test() : undefined,
              ()=> [this.testFunction]
            );

            renderSuccess() {
              return html\`<div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
              <sl-icon style="font-size: 64px; color: green" .src=\${wrapPathInSvg(mdiCheck)}></sl-icon>
                <span>Success!</span>
                <span>You can move on.</span>
              </div>\`;
            }

            renderFailure(error: any) {
              return html\`<div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
              <sl-icon style="font-size: 64px; color: red" .src=\${wrapPathInSvg(mdiAlert)}></sl-icon>
                <span>Error!</span>
                <span>\${error.message}</span>
              </div>\`;
            }

            renderExecuting() {
              return html\`<div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
                <sl-spinner style="font-size: 64px"></sl-spinner>
                <span>Executing...</span>
                <span>Wait for it.</span>
              </div>\`;
            }

            render() {
              if (!this.testFunction) {
                return html\`<span>Attempt to solve the exercise.</span>\`;
              }

              return this._testTask.render({
                pending: () => this.renderExecuting(),
                complete: () => this.renderSuccess(),
                error: error => this.renderFailure(error)
              })
            }
          }
        </script>

        <script type="sample/html" filename="index.html">
          <!doctype html>
          <head>
            <script type="module">
              import './assert.js';
              import './test-result.js';
              import { test } from './test.js';

              document.querySelector('test-result').testFunction = test;
            &lt;/script>
          </head>
          <style>
          body {
            font-family: sans-serif
          }
          </style>
          <body>
            <test-result></test-result>
          </body>
        </script>
      </playground-project>

      <div style="display: flex; flex-direction: row; flex: 1">
        <playground-file-editor
          project="project1"
          filename="index.ts"
          style="height: unset; flex: 1"
        ></playground-file-editor>

        ${this.syntaxError
          ? html`
              <div
                style="flex-basis: 300px; display: flex; flex-direction: column; align-items: center;"
              >
                <div
                  style="margin: 16px; display: flex; flex-direction: column; align-items: center; gap: 16px"
                >
                  <sl-icon
                    style=" font-size: 64px; color: red"
                    .src=${wrapPathInSvg(mdiAlert)}
                  ></sl-icon>
                  <span>Syntax error!</span>
                </div>
              </div>
            `
          : this.exportError
          ? html`
              <div
                style="flex-basis: 300px; display: flex; flex-direction: column; align-items: center;"
              >
                <div
                  style="margin: 16px; display: flex; flex-direction: column; align-items: center; gap: 16px"
                >
                  <sl-icon
                    style=" font-size: 64px; color: red"
                    .src=${wrapPathInSvg(mdiAlert)}
                  ></sl-icon>
                  <span>Error while importing</span>
                  <span
                    >Make sure you didn't change the name of any exports.</span
                  >
                </div>
              </div>
            `
          : html`
              <playground-preview
                project="project1"
                style="height: unset; flex-basis: 300px"
              >
              </playground-preview>
            `}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
    }
    span {
      text-align: center;
    }
  `;
}
