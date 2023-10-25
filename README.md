# playground-exercise

Custom element to create code exercises for typescript on the web, using playground-elements.

## Installation

```bash
npm install playground-exercise
```

## Usage

1. Import the element:

```js
import 'playground-exercise';
```

Now the `playground-exercise` is registered and available in your HTML.

You can use it like this: 

```html
    <playground-exercise>
      <script type="sample/ts" filename="index.ts">
        // Write here the initial code that the students will encounter when seeing the exercise
        export function someCode() {
          return 1;
        }
      </script>
      <script type="sample/js" filename="test.ts">
        import { someCode } from './index.js';
        import { assert } from './assert.js';

        // Write here the test for the exercise
        // Don't change the name or signature of this function
        export async function test() {
          const a = someCode();
          assert.equal(a, 1, "Some clear message about why this error ocurred");
        }
      </script>
    </playground-exercise>
```

You can theme it following the same instructions from [playground-elements](https://github.com/google/playground-elements#themes).