#!/bin/bash

components=(
  "accordion"
  "alert-dialog"
  "aspect-ratio"
  "avatar"
  "checkbox"
  "collapsible"
  "context-menu"
  "dialog"
  "dropdown-menu"
  "hover-card"
  "label"
  "menubar"
  "navigation-menu"
  "popover"
  "progress"
  "radio-group"
  "scroll-area"
  "select"
  "separator"
  "slider"
  "slot"
  "switch"
  "tabs"
  "toast"
  "toggle"
  "toggle-group"
  "tooltip"
)

for comp in "${components[@]}"; do
  npx shadcn@latest add "$comp"
done
