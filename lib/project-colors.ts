export const projectPalettes = [
  { titleColor: "#b52b1d", backgroundColor: "#f9e7df" },
  { titleColor: "#2456a6", backgroundColor: "#e3ecfa" },
  { titleColor: "#246540", backgroundColor: "#e4efe2" },
  { titleColor: "#986112", backgroundColor: "#fbefcf" },
  { titleColor: "#a52b59", backgroundColor: "#f8e2eb" },
  { titleColor: "#584b3e", backgroundColor: "#ece5da" },
  { titleColor: "#126b75", backgroundColor: "#dff1f0" },
  { titleColor: "#964315", backgroundColor: "#f5e0cc" },
];

export function getProjectColors(project: { titleColor?: string; backgroundColor?: string }) {
  const titleColor = project.titleColor ?? projectPalettes[0].titleColor;
  const backgroundColor = project.backgroundColor ?? projectPalettes[0].backgroundColor;
  const rgb = backgroundColor.slice(1).match(/../g)?.map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  }) ?? [1, 1, 1];
  const luminance = .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  return { titleColor, backgroundColor, ink: luminance > .179 ? "#111111" : "#ffffff" };
}
