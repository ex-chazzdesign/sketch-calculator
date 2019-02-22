# sketch-calculator
Calculates layer values referencing other layers.

# Usage

## Numeric operations

Let's learn how it works with a simple example:
1. Create a text layer named `layer_1` with the value `3`.
2. Create a text layer named `layer_2` with the value `10`.
3. Create a text layer named `={layer_1} + {layer_2}` with any value and run the plugin. 
4. The value should be changed to `13`, the sum of `layer_1` and `layer_2`.
5. Now, change the value of `layer_1` or `layer_2`. The last layer should be automatically recalculated.

You can also use other arithmetic operations. 

Try creating the following:
1. `={layer_1} * 2`
2. `={layer_1} - {layer_2}`
3. `={layer_1} + (100 * ({layer_2} / 2))`

You can also simply reference other field. That's useful, for example, when you need to define a value in a single place of and use it along the document:
1. `={layer_1}`

## String operations

The plugin also support a number of operation with strings:

### Concatenation of strings
`=CONCAT({layer_1}, {*layer_2}, {layer_3})`

### Uppercase
`=UPPER({layer_1})`

### Lowercase
`=LOWER({layer_1})`

## Scope

By default, layer names in formulas will be searched in the same artboard as the formula layer. But formulas can also include references to layers in other artboards by being referenced with a `*` before the name. For example:

1. `={layer_1}` uses the value of `layer_1` layer in the same artboard.
2. `={*layer_1}` uses the value of the first `layer_1` layer that exists in any artboard of the document.

# Caveats

1. For the moment the plugin only works with "," as decimal separator.
2. We haven't done any performance optimization yet, so it might be slow in complex documents.
