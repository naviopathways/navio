# Navio Pathways colour palette

The palette is taken directly from the current Navio Pathways design tokens.

## Core colours

| Name | Hex | Best use |
| --- | --- | --- |
| Midnight | `#383842` | Main page background, dark controls |
| Charcoal | `#3D3B47` | Raised panels, cards, alternate sections |
| Plum | `#523D57` | Gradient panels, branded surfaces |
| Magenta | `#8C3880` | Primary button start, deep accent, glow |
| Fuchsia | `#AD4794` | Primary button end, active accent |
| Orchid | `#BF66AD` | Headlines, links, labels, status accents |
| White | `#FFFFFF` | Main headings, logos, high-contrast text |

## Text and border opacity

Use white with opacity instead of introducing extra grey colours:

```css
--ink-soft: rgba(255, 255, 255, 0.86); /* primary body text */
--muted: rgba(255, 255, 255, 0.66);    /* secondary text */
--line: rgba(255, 255, 255, 0.12);     /* quiet borders and dividers */
--line-strong: rgba(255, 255, 255, 0.24); /* input borders and emphasis */
```

## Recommended combinations

### Primary action

```css
background: linear-gradient(135deg, #8C3880, #AD4794);
color: #FFFFFF;
```

### Dark panel

```css
background: #3D3B47;
border: 1px solid rgba(255, 255, 255, 0.12);
color: rgba(255, 255, 255, 0.86);
```

### Branded panel

```css
background: linear-gradient(155deg, #523D57, #3D3B47);
border: 1px solid rgba(255, 255, 255, 0.24);
```

### Accent text

```css
color: #BF66AD;
```

## Existing design-token mapping

```css
:root {
  --magenta: #8C3880;
  --fuchsia: #AD4794;
  --orchid: #BF66AD;
  --plum: #523D57;
  --charcoal: #3D3B47;
  --midnight: #383842;
  --white: #FFFFFF;
}
```
