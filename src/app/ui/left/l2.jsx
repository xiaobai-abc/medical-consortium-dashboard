
import ScreenLineTrendChart from "@/app/components/screen-line-trend-chart";

const alertTrendData = [
  { date: "03-16", value: 148 },
  { date: "03-21", value: 172 },
  { date: "03-26", value: 135 },
  { date: "03-31", value: 194 },
  { date: "04-05", value: 168 },
  { date: "04-10", value: 126 },
  { date: "04-14", value: 156 },
];

function LeftL2() {
  const dates = alertTrendData.map(function mapDate(item) {
    return item.date;
  });
  const values = alertTrendData.map(function mapValue(item) {
    return item.value;
  });

  return (
    <div className="w-full h-[320px] bd1 rounded-2xl px-3.5 py-4 flex flex-col">
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">近30日异常数据报警趋势</h3>
        <div
          className="h-[1px] w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(155, 109, 247, 0.4) 0%, transparent 100%)",
          }}
        />
      </div>
      <div className="flex-1 rounded-2xl border border-[#7F69D7]/18 bg-[rgba(10,23,47,0.45)] px-3 py-3">
        <ScreenLineTrendChart
          dates={dates}
          values={values}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

export default LeftL2;
