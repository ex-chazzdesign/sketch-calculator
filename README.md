# sketch-calculator
Calculates layer values referencing other layers.

# Usage

## Numeric operations

Let's learn how it works with a simple example:
1. Create a text layer named "layer_1" with the value "3"
2. Create a text layer named "layer_2" with the value "10"
3. Create a text layer named "={layer_1}+{layer_2}" with any value and run the plugin. The value should be changed to 13, the sum of layer_1 and layer_2
4. Now, change the value of layer_1 or layer_2. The last layer should be automatically recalculated.

You can also use other arithmetic operations. Try creating the following:
1. `={layer_1}*2`
2. `={layer_1}-{layer_2}`
3. `={layer_1}+100*{layer_2}/2`

You can also simply reference other field. That's useful, for example, when you need to define a value in a single place of and use it along the document:
1. `={layer_1}`

## String operations

# Caveats

1. For the moment the plugin only works with "," as decimal separator.
2. We haven't done any performance optimization yet, so it might be slow in complex documents.
3. Currently the plugin only searches layer names in the same artboard.
