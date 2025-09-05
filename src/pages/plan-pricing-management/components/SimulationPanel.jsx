import React from 'react';
import Button from '../../../components/ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3, 
  X,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

const SimulationPanel = ({ simulationData, onClear }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })?.format(amount || 0);
  };

  const getImpactColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <BarChart3 className="w-5 h-5 text-gray-500" />;
  };

  const getRiskLevel = () => {
    const { revenueImpact, subscriberImpact, conversionImpact } = simulationData;
    
    let riskScore = 0;
    if (revenueImpact < -5000) riskScore += 2;
    if (subscriberImpact < -100) riskScore += 2;
    if (conversionImpact < -5) riskScore += 1;
    
    if (riskScore >= 4) return { level: 'high', color: 'red', text: 'High Risk' };
    if (riskScore >= 2) return { level: 'medium', color: 'yellow', text: 'Medium Risk' };
    return { level: 'low', color: 'green', text: 'Low Risk' };
  };

  const riskAssessment = getRiskLevel();

  return (
    <div className="bg-white shadow rounded-lg border-l-4 border-l-purple-500">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Simulation Results</h2>
          </div>
          <Button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-6">
        {/* Risk Assessment */}
        <div className={`mb-6 p-4 rounded-lg border ${
          riskAssessment?.level === 'high' ? 'bg-red-50 border-red-200' :
          riskAssessment?.level === 'medium'? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center">
            {riskAssessment?.level === 'high' ? (
              <AlertTriangle className={`w-5 h-5 text-${riskAssessment?.color}-500 mr-2`} />
            ) : (
              <CheckCircle className={`w-5 h-5 text-${riskAssessment?.color}-500 mr-2`} />
            )}
            <div>
              <h3 className={`font-medium text-${riskAssessment?.color}-800`}>
                Risk Assessment: {riskAssessment?.text}
              </h3>
              <p className={`text-sm text-${riskAssessment?.color}-700 mt-1`}>
                {riskAssessment?.level === 'high' && 'These changes may significantly impact subscriber retention and revenue.'}
                {riskAssessment?.level === 'medium' && 'Monitor these changes closely for subscriber and revenue impact.'}
                {riskAssessment?.level === 'low' && 'These changes are expected to have minimal negative impact.'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div className={`text-2xl font-bold ${getImpactColor(simulationData?.revenueImpact)}`}>
              {simulationData?.revenueImpact > 0 ? '+' : ''}
              {formatCurrency(simulationData?.revenueImpact || 0)}
            </div>
            <div className="text-sm text-gray-500">Revenue Impact</div>
            <div className="mt-1 flex items-center justify-center">
              {getImpactIcon(simulationData?.revenueImpact)}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className={`text-2xl font-bold ${getImpactColor(simulationData?.subscriberImpact)}`}>
              {simulationData?.subscriberImpact > 0 ? '+' : ''}
              {simulationData?.subscriberImpact?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Subscriber Impact</div>
            <div className="mt-1 flex items-center justify-center">
              {getImpactIcon(simulationData?.subscriberImpact)}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <div className={`text-2xl font-bold ${getImpactColor(simulationData?.conversionImpact)}`}>
              {simulationData?.conversionImpact > 0 ? '+' : ''}
              {simulationData?.conversionImpact?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-sm text-gray-500">Conversion Impact</div>
            <div className="mt-1 flex items-center justify-center">
              {getImpactIcon(simulationData?.conversionImpact)}
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(simulationData?.projectedRevenue || 0)}
            </div>
            <div className="text-sm text-gray-500">Projected Revenue</div>
            <div className="mt-1 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Impact Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Analysis</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Monthly impact: {formatCurrency(simulationData?.revenueImpact || 0)}</li>
                    <li>• Annual projection: {formatCurrency((simulationData?.revenueImpact || 0) * 12)}</li>
                    <li>• New monthly total: {formatCurrency(simulationData?.projectedRevenue || 0)}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Subscriber Analysis</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Expected churn/growth: {simulationData?.subscriberImpact || 0} users</li>
                    <li>• Conversion rate change: {simulationData?.conversionImpact > 0 ? '+' : ''}{simulationData?.conversionImpact || 0}%</li>
                    <li>• Risk level: {riskAssessment?.text}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recommended Implementation</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    Suggested Effective Date: {simulationData?.effectiveDate}
                  </div>
                  <div className="text-sm text-blue-800 mt-1">
                    This allows for a 7-day notice period and aligns with the next billing cycle for most users.
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-medium text-blue-900">Implementation Steps:</div>
                    <ol className="text-sm text-blue-800 mt-1 list-decimal list-inside space-y-1">
                      <li>Notify existing subscribers of pricing changes</li>
                      <li>Update subscription plans in the system</li>
                      <li>Monitor conversion and retention metrics</li>
                      <li>Adjust marketing messaging accordingly</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          {(simulationData?.revenueImpact < -2000 || simulationData?.subscriberImpact < -50) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" />
                <div>
                  <div className="text-sm font-medium text-yellow-900">
                    Caution: Significant Impact Detected
                  </div>
                  <div className="text-sm text-yellow-800 mt-1">
                    These pricing changes may result in substantial revenue or subscriber loss. 
                    Consider implementing gradual changes or offering transition incentives.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Simulation based on historical data and industry benchmarks
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={onClear}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Run New Simulation
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Export Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;