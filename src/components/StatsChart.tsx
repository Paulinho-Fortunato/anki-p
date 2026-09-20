import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, G, Rect, Text as SvgText, Line, Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
  barWidth?: number;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 150,
  barWidth = 30,
  color,
}) => {
  const theme = useTheme();
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 30; // Space for labels
  const gap = 8;
  const totalWidth = data.length * (barWidth + gap);

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${totalWidth} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={i}
            x1="0"
            y1={chartHeight * (1 - ratio)}
            x2={totalWidth}
            y2={chartHeight * (1 - ratio)}
            stroke={theme.colors.border}
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / max) * chartHeight;
          const x = index * (barWidth + gap);
          const y = chartHeight - barHeight;

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={color || theme.colors.accent}
                opacity="0.8"
              />
              {/* Value label */}
              {item.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill={theme.colors.textSecondary}
                  textAnchor="middle"
                >
                  {item.value}
                </SvgText>
              )}
              {/* Day label */}
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 15}
                fontSize="9"
                fill={theme.colors.textSecondary}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  showPoints?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 150,
  color,
  showPoints = true,
}) => {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 30;
  const gap = 40;
  const totalWidth = (data.length - 1) * gap;

  if (data.length < 2) {
    return (
      <View style={[styles.container, { height }]}>
        <Svg width="100%" height={height}>
          <SvgText
            x="50%"
            y="50%"
            fontSize="12"
            fill={theme.colors.textSecondary}
            textAnchor="middle"
          >
            Dados insuficientes
          </SvgText>
        </Svg>
      </View>
    );
  }

  const points = data.map((item, index) => ({
    x: index * gap,
    y: chartHeight - (item.value / max) * chartHeight,
    label: item.label,
    value: item.value,
  }));

  // Create path for line
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    // Smooth curve using quadratic bezier
    const prevPoint = points[index - 1];
    const cpX = (prevPoint.x + point.x) / 2;
    return `${path} Q ${cpX} ${prevPoint.y} ${point.x} ${point.y}`;
  }, '');

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${totalWidth} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={i}
            x1="0"
            y1={chartHeight * (1 - ratio)}
            x2={totalWidth}
            y2={chartHeight * (1 - ratio)}
            stroke={theme.colors.border}
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}

        {/* Line path */}
        <Path
          d={linePath}
          stroke={color || theme.colors.accent}
          strokeWidth="2"
          fill="none"
        />

        {/* Points and labels */}
        {points.map((point, index) => (
          <G key={index}>
            {showPoints && (
              <Circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color || theme.colors.accent}
              />
            )}
            <SvgText
              x={point.x}
              y={chartHeight + 15}
              fontSize="9"
              fill={theme.colors.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
            {point.value > 0 && (
              <SvgText
                x={point.x}
                y={point.y - 8}
                fontSize="8"
                fill={theme.colors.textSecondary}
                textAnchor="middle"
              >
                {point.value}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
