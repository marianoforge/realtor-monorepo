import { View, Text } from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import { formatNumber } from "@gds-si/shared-utils/formatNumber";

interface ObjectiveProgressProps {
  percentage: number;
  current: number;
  target: number;
  currencySymbol: string;
  year: number;
}

function GaugeChart({ percentage }: { percentage: number }) {
  const radius = 80;
  const innerRadius = radius * 0.62;
  const cx = 0;
  const cy = 0;

  const clampedPct = Math.min(Math.max(percentage, 0), 100);

  const startAngle = (3 / 4) * Math.PI;
  const totalSweep = (3 / 2) * Math.PI;

  const toAngle = (pct: number) => startAngle + (pct / 100) * totalSweep;

  const segments = [
    { start: 0, end: 25, color: "#f87171" },
    { start: 25, end: 50, color: "#fbbf24" },
    { start: 50, end: 75, color: "#4ade80" },
    { start: 75, end: 100, color: "#a3e635" },
  ];

  const arcPath = (startPct: number, endPct: number, r: number, ir: number) => {
    const s = toAngle(startPct);
    const e = toAngle(endPct);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const x3 = cx + ir * Math.cos(e);
    const y3 = cy + ir * Math.sin(e);
    const x4 = cx + ir * Math.cos(s);
    const y4 = cy + ir * Math.sin(s);
    const sweep = endPct - startPct;
    const largeArc = sweep > 50 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${ir},${ir} 0 ${largeArc} 0 ${x4},${y4} Z`;
  };

  const pad = 12;
  const vbSize = (radius + pad) * 2;
  const bottomCut = radius * 0.25;

  return (
    <Svg
      width={220}
      height={180}
      viewBox={`${-radius - pad} ${-radius - pad} ${vbSize} ${vbSize - bottomCut}`}
    >
      {segments.map((seg) => {
        const bgD = arcPath(seg.start, seg.end, radius, innerRadius);
        const isFilled = clampedPct > seg.start;
        const fillEnd = Math.min(clampedPct, seg.end);
        const fillD =
          isFilled && fillEnd > seg.start
            ? arcPath(seg.start, fillEnd, radius, innerRadius)
            : null;

        return (
          <G key={seg.start}>
            <Path d={bgD} fill="#e5e7eb" />
            {fillD && <Path d={fillD} fill={seg.color} />}
          </G>
        );
      })}

      <SvgText
        x="0"
        y="-8"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="#64748b"
      >
        Objetivo
      </SvgText>
      <SvgText
        x="0"
        y="16"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fill="#1e293b"
      >
        {clampedPct.toFixed(1)}%
      </SvgText>
    </Svg>
  );
}

export default function ObjectiveProgress({
  percentage,
  current,
  target,
  currencySymbol,
  year,
}: ObjectiveProgressProps) {
  const remaining = target - current;

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-bold text-slate-800 text-center mb-2">
        Objetivo Anual de Ventas {year}
      </Text>

      {target <= 0 ? (
        <View className="items-center py-6">
          <Text className="text-slate-500 text-center text-sm">
            Configurá tu objetivo anual para ver tu progreso
          </Text>
        </View>
      ) : (
        <View className="items-center">
          <GaugeChart percentage={percentage} />

          <View className="flex-row w-full mt-1">
            <View className="flex-1 items-center">
              <Text className="text-xs text-slate-500 font-medium">Actual</Text>
              <Text className="text-base font-bold text-slate-800">
                {currencySymbol}
                {formatNumber(current)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xs text-slate-500 font-medium">
                Objetivo
              </Text>
              <Text className="text-base font-bold text-slate-800">
                {currencySymbol}
                {formatNumber(target)}
              </Text>
            </View>
          </View>

          <View className="w-full mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-slate-500 text-center">
              {percentage >= 100
                ? "Objetivo alcanzado!"
                : `Faltan ${currencySymbol}${formatNumber(remaining)} para lograr el objetivo`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
