import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface HourlyData {
  hour: number;
  count: number;
  totalAmount: number;
  hourLabel: string;
}

interface HourlyPatternsChartProps {
  data: HourlyData[];
  title: string;
  className?: string;
}

export function HourlyPatternsChart({
  data,
  title,
  className,
}: HourlyPatternsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.hourLabel}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-600">
              Submissions: <span className="font-medium">{data.count}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total Amount: <span className="font-medium">{formatCurrency(data.totalAmount)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Avg per Hour: <span className="font-medium">{formatCurrency(data.totalAmount / Math.max(data.count, 1))}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find peak hours
  const peakHour = data.reduce((prev, current) =>
    (prev.count > current.count) ? prev : current
  );

  const offPeakHour = data.reduce((prev, current) =>
    (prev.count < current.count) ? prev : current
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {peakHour.hour}:00
              </div>
              <div className="text-sm text-gray-600">Peak Hour</div>
              <div className="text-sm font-medium">{peakHour.count} submissions</div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(data.reduce((sum, hour) => sum + hour.totalAmount, 0) / data.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Hourly Amount</div>
              <div className="text-sm font-medium">Across all hours</div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.reduce((sum, hour) => sum + hour.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Submissions</div>
              <div className="text-sm font-medium">24-hour period</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Hourly Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.map((hour, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{hour.hourLabel}</span>
                  <Badge variant="outline" className="text-xs">
                    {hour.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}