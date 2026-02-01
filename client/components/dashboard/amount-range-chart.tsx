import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AmountRangeData {
  range: string;
  count: number;
  totalAmount: number;
  approved: number;
  pending: number;
  approvalRate: number;
}

interface AmountRangeChartProps {
  data: AmountRangeData[];
  title: string;
  className?: string;
}

export function AmountRangeChart({
  data,
  title,
  className,
}: AmountRangeChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-600">
              Count: <span className="font-medium">{data.count}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total Amount: <span className="font-medium">{formatCurrency(data.totalAmount)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Approved: <span className="font-medium text-green-600">{data.approved}</span>
            </p>
            <p className="text-sm text-gray-600">
              Pending: <span className="font-medium text-amber-600">{data.pending}</span>
            </p>
            <p className="text-sm text-gray-600">
              Approval Rate: <span className="font-medium">{data.approvalRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" name="Count" />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((range, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{range.range}</span>
                  <Badge variant="outline">{range.count} requests</Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{formatCurrency(range.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate:</span>
                    <span className="font-medium text-green-600">{range.approvalRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}