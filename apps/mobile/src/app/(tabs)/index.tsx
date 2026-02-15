import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import { AppHeader } from "../../components/AppHeader";
import KPIGrid from "../../components/dashboard/KPIGrid";
import ObjectiveProgress from "../../components/dashboard/ObjectiveProgress";
import {
  ProfitabilityCard,
  TotalProfitabilityCard,
  DaysToSellCard,
} from "../../components/dashboard/StatsCards";
import ExclusivitySection from "../../components/dashboard/ExclusivitySection";
import OperationTypeSection from "../../components/dashboard/OperationTypeSection";
import PropertyTypeSection from "../../components/dashboard/PropertyTypeSection";
import SharedOpsSection from "../../components/dashboard/SharedOpsSection";
import FallenOpsSection from "../../components/dashboard/FallenOpsSection";
import ProjectionsSection from "../../components/dashboard/ProjectionsSection";
import MonthlyComparisonSection from "../../components/dashboard/MonthlyComparisonSection";
import GrossFeePercentageSection from "../../components/dashboard/GrossFeePercentageSection";

function DashboardLoading() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3f37c9" />
      <Text className="text-mutedBlue text-sm mt-4">Cargando dashboard...</Text>
    </View>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <Text className="text-red-500 text-base font-semibold mb-2">
        Error al cargar datos
      </Text>
      <Text className="text-slate-500 text-sm text-center mb-4">{message}</Text>
      <Text className="text-mediumBlue text-sm font-medium" onPress={onRetry}>
        Reintentar
      </Text>
    </View>
  );
}

function EmptyDashboard() {
  return (
    <View className="bg-white rounded-2xl p-8 border border-gray-100 items-center">
      <Text className="text-lg font-bold text-slate-800 mb-2">
        Sin operaciones
      </Text>
      <Text className="text-sm text-slate-500 text-center">
        Aún no tenés operaciones cargadas. Empezá a cargar desde la web para ver
        tus métricas acá.
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { metrics, isLoading, error, refetch } = useDashboardMetrics();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 1500);
  }, [refetch]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3f37c9"
            colors={["#3f37c9"]}
          />
        }
      >
        <AppHeader
          subtitle={metrics ? `Dashboard ${metrics.effectiveYear}` : undefined}
        />

        <View className="px-4 pt-4 gap-4">
          {isLoading && !metrics ? (
            <DashboardLoading />
          ) : error && !metrics ? (
            <DashboardError message={error.message} onRetry={refetch} />
          ) : !metrics ? (
            <EmptyDashboard />
          ) : (
            <>
              <KPIGrid kpis={metrics.kpis} />

              <ObjectiveProgress
                percentage={metrics.objectivePercentage}
                current={metrics.objectiveCurrent}
                target={metrics.objectiveTarget}
                currencySymbol={metrics.currencySymbol}
                year={metrics.effectiveYear}
              />

              <View className="flex-row gap-3">
                <ProfitabilityCard percentage={metrics.profitability} />
                <TotalProfitabilityCard
                  percentage={metrics.profitabilityTotal}
                />
              </View>

              <DaysToSellCard avgDays={metrics.avgDaysToSell} />

              <ExclusivitySection
                exclusiveCount={metrics.exclusiveCount}
                nonExclusiveCount={metrics.nonExclusiveCount}
                exclusivityPercentage={metrics.exclusivityPercentage}
                nonExclusivityPercentage={metrics.nonExclusivityPercentage}
                totalOps={metrics.totalExclusivityOps}
                year={metrics.effectiveYear}
                unspecifiedCount={metrics.unspecifiedExclusivityCount}
              />

              <GrossFeePercentageSection
                data={metrics.grossFeePercentageByMonth}
                average={metrics.grossFeeAverage}
                currentYear={metrics.grossFeePercentageCalendarYear}
                previousYear={metrics.grossFeePercentagePastCalendarYear}
              />

              <OperationTypeSection
                items={metrics.operationTypesPie}
                totalOps={metrics.totalOperationsPie}
              />

              <PropertyTypeSection
                items={metrics.propertyTypes}
                totalOps={metrics.totalPropertyOps}
              />

              <SharedOpsSection
                sharedCount={metrics.sharedCount}
                nonSharedCount={metrics.nonSharedCount}
                sharedPercentage={metrics.sharedPercentage}
                nonSharedPercentage={metrics.nonSharedPercentage}
                totalOps={metrics.totalClassifiedOps}
                year={metrics.effectiveYear}
              />

              {metrics.totalFallen > 0 && (
                <FallenOpsSection
                  items={metrics.fallenTypes}
                  totalFallen={metrics.totalFallen}
                  fallenPercentage={metrics.fallenPercentage}
                />
              )}

              <ProjectionsSection
                accumulated={metrics.projectionAccumulated}
                total={metrics.projectionTotal}
                percentage={metrics.projectionPercentage}
                currentMonthFees={metrics.currentMonthFees}
                currentMonthName={metrics.currentMonthName}
                monthly={metrics.monthlyProjection}
                currencySymbol={metrics.currencySymbol}
                year={metrics.effectiveYear}
              />

              <MonthlyComparisonSection
                title={`Honorarios Netos Mensuales ${metrics.effectiveYear}`}
                data={metrics.monthlyNetFees}
                totalCurrent={metrics.totalNetCurrent}
                totalPrevious={metrics.totalNetPrevious}
                currentYear={metrics.effectiveYear}
                previousYear={metrics.effectiveYear - 1}
                currencySymbol={metrics.currencySymbol}
                currentColor="#f472b6"
                previousColor="#c084fc"
              />

              <MonthlyComparisonSection
                title={`Honorarios Brutos Mensuales ${metrics.effectiveYear}`}
                data={metrics.monthlyGrossFees}
                totalCurrent={metrics.totalGrossCurrent}
                totalPrevious={metrics.totalGrossPrevious}
                currentYear={metrics.effectiveYear}
                previousYear={metrics.effectiveYear - 1}
                currencySymbol={metrics.currencySymbol}
                currentColor="#fbbf24"
                previousColor="#a3e635"
                diffLabel="Diferencia Interanual (Brutos)"
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
