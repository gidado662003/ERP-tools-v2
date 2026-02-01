import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DepartmentTrend {
  department: string;
  month: number;
  year: number;
  count: number;
  totalAmount: number;
  approved: number;
  pending: number;
  approvalRate: number;
}

interface DepartmentTrendsChartProps {
  data: DepartmentTrend[];
  title: string;
  className?: string;
}

export function DepartmentTrendsChart({
  data,
  title,
  className,
}: DepartmentTrendsChartProps) {
  // Group data by department
  const departmentGroups = data.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = [];
    }
    acc[item.department].push({
      ...item,
      monthYear: `${item.year}-${String(item.month).padStart(2, '0')}`,
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Get top 5 departments by total count
  const departmentTotals = Object.entries(departmentGroups).map(([dept, items]) => ({
    department: dept,
    totalCount: items.reduce((sum, item) => sum + item.count, 0),
    totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
    avgApprovalRate: items.reduce((sum, item) => sum + item.approvalRate, 0) / items.length,
  })).sort((a, b) => b.totalCount - a.totalCount);

  const topDepartments = departmentTotals.slice(0, 5);

  // Prepare chart data - combine all departments into a time series
  const allMonths = [...new Set(data.map(d => `${d.year}-${String(d.month).padStart(2, '0')}`))].sort();

  const chartData = allMonths.map(monthYear => {
    const [year, month] = monthYear.split('-').map(Number);
    const dataPoint: any = { monthYear };

    topDepartments.forEach(dept => {
      const deptData = departmentGroups[dept.department].find(
        d => d.year === year && d.month === month
      );
      dataPoint[dept.department] = deptData ? deptData.count : 0;
    });

    return dataPoint;
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.dataKey}: <span className="font-medium">{entry.value}</span>
              </p>
            ))}
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
        <div className="space-y-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {topDepartments.map((dept, index) => (
                  <Line
                    key={dept.department}
                    type="monotone"
                    dataKey={dept.department}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Department Performance Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topDepartments.map((dept, index) => (
                <div key={dept.department} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{dept.department}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Requests:</span>
                      <span className="font-medium">{dept.totalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">₦{dept.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Approval Rate:</span>
                      <span className="font-medium text-green-600">{dept.avgApprovalRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}