import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
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
              import { mdiAlert, mdiCheck } from '@mdi/js';
              import { LitElement, html, css } from 'lit';
              import { customElement, property } from 'lit/decorators.js';
              import { Task } from '@lit/task';

              function wrapPathInSvgBase64(path: string): string {
                return \`data:image/svg+xml;base64,\${btoa(unescape(encodeURIComponent(wrapPathInSvgWithoutPrefix(path))))}\`;
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
                    <svg style="width:64px;height:64px; " viewBox="0 0 24 24">
                      <path fill="green" d="\${mdiCheck}"/>
                    </svg>
                    <span>Success!</span>
                    <span>You can move on.</span>
                  </div>\`;
                }

                renderFailure(error: any) {
                  return html\`<div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
                    <svg style="width:64px; height:64px;" viewBox="0 0 24 24">
                      <path fill="red" d="\${mdiAlert}"/>
                    </svg>
                    <span>Error!</span>
                    <span>\${error.message}</span>
                  </div>\`;
                }

                renderExecuting() {
                  return html\`<div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
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

          static styles = css\`span {
            text-align: center;
          font-size: 18px;
          }\`;
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
                style="background-color: white; flex-basis: 300px; display: flex; flex-direction: column; align-items: center;"
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
                style="background-color: white; flex-basis: 300px; display: flex; flex-direction: column; align-items: center;"
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
      color: black;
      font-size: 18px;
      text-align: center;
    }
  `;
}
