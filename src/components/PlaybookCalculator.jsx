import React, { useState, useEffect } from 'react';

const PlaybookCalculator = () => {
  // Default state
  const [inputs, setInputs] = useState({
    incidents: 50,
    autoPercent: 30,
    manual: 5,
    duration: 20,
    durationUnit: 'seconds',
    timePeriod: 'per hour'
  });

  // Result state
  const [result, setResult] = useState({
    workerCount: 0,
    calculatedCount: 0,
    isOverLimit: false,
    autoTriggered: 0,
    totalPlaybooks: 0,
    normalizedDuration: 0,
    withDuration: 0
  });

  // Example configurations
  const examples = {
    small: {
      title: "Small SOC",
      incidents: 100,
      autoPercent: 30,
      manual: 5,
      duration: 30,
      durationUnit: 'seconds',
      timePeriod: 'per hour',
      description: "A small security operations center with limited incident volume",
      result: 1
    },
    medium: {
      title: "Medium SOC",
      incidents: 500,
      autoPercent: 50,
      manual: 25,
      duration: 45,
      durationUnit: 'seconds',
      timePeriod: 'per hour',
      description: "A mid-sized security operations center with moderate automation",
      result: 4
    },
    large: {
      title: "Large SOC",
      incidents: 750,
      autoPercent: 70,
      manual: 50,
      duration: 60,
      durationUnit: 'seconds',
      timePeriod: 'per hour',
      description: "A large security operations center with high automation",
      result: 10,
    }
  };

  // Calculate whenever inputs change
  useEffect(() => {
    calculateWorkers();
  }, [inputs]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: name === 'autoPercent' ? Math.min(100, Math.max(0, parseFloat(value) || 0)) : parseFloat(value) || 0
    }));
  };

  // Handle select changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  };

  // Load example configuration
  const loadExample = (exampleKey) => {
    const example = examples[exampleKey];
    setInputs({
      incidents: example.incidents,
      autoPercent: example.autoPercent,
      manual: example.manual,
      duration: example.duration,
      durationUnit: example.durationUnit,
      timePeriod: example.timePeriod
    });
  };

  // Calculate worker count
  const calculateWorkers = () => {
    const { incidents, autoPercent, manual, duration, durationUnit, timePeriod } = inputs;

    // Convert duration to the same time unit as the time period
    let normalizedDuration;
    if (timePeriod.includes('hour')) {
      normalizedDuration = durationUnit === 'seconds' ?
        duration / 3600 : // seconds to hours
        duration / 60;    // minutes to hours
    } else if (timePeriod.includes('minute')) {
      normalizedDuration = durationUnit === 'seconds' ?
        duration / 60 : // seconds to minutes
        duration;       // already in minutes
    } else if (timePeriod.includes('day')) {
      normalizedDuration = durationUnit === 'seconds' ?
        duration / 86400 : // seconds to days
        duration / 1440;   // minutes to days
    } else if (timePeriod.includes('week')) {
      normalizedDuration = durationUnit === 'seconds' ?
        duration / (86400 * 7) : // seconds to weeks
        duration / (1440 * 7);   // minutes to weeks
    } else if (timePeriod.includes('month')) {
      normalizedDuration = durationUnit === 'seconds' ?
        duration / (86400 * 30) : // seconds to months
        duration / (1440 * 30);   // minutes to months
    } else {
      normalizedDuration = duration;
    }

    // Calculate components
    const autoTriggered = incidents * (autoPercent / 100);
    const totalPlaybooks = autoTriggered + manual;
    const withDuration = totalPlaybooks * normalizedDuration;

    // Round up to the nearest whole number, max of 10
    let workerCount = Math.ceil(withDuration);
    const calculatedCount = workerCount;

    // Cap at maximum 10 workers
    const isOverLimit = workerCount > 10;
    if (isOverLimit) {
      workerCount = 10;
    }

    setResult({
      workerCount,
      calculatedCount,
      isOverLimit,
      autoTriggered,
      totalPlaybooks,
      normalizedDuration,
      withDuration
    });
  };

  // Get time unit display text
  const getTimeUnitText = () => {
    const { timePeriod } = inputs;
    if (timePeriod.includes('hour')) return 'hours';
    if (timePeriod.includes('minute')) return 'minutes';
    if (timePeriod.includes('day')) return 'days';
    if (timePeriod.includes('week')) return 'weeks';
    if (timePeriod.includes('month')) return 'months';
    return 'time units';
  };

  return (
    <div className="mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">Playbook Worker Sizing Calculator</h1>

      {/* Example Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Example Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(examples).map(key => (
            <div
              key={key}
              className="rounded-lg shadow-md p-4 border-l-4 cursor-pointer hover:shadow-lg transition-shadow"
              style={{borderLeftColor:
                key === 'small' ? '#4caf50' :
                key === 'medium' ? '#2196f3' :
                '#f44336'}}
              onClick={() => loadExample(key)}
            >
              <h3 className="font-bold text-lg mb-2">{examples[key].title}</h3>
              <p className="text-sm text-gray-600 mb-2">{examples[key].description}</p>
              <div className="text-sm">
                <div><span className="font-semibold">Incidents:</span> {examples[key].incidents} {examples[key].timePeriod}</div>
                <div><span className="font-semibold">Auto-trigger:</span> {examples[key].autoPercent}%</div>
                <div><span className="font-semibold">Manual trigger:</span> {examples[key].manual}</div>
                <div><span className="font-semibold">Duration:</span> {examples[key].duration} {examples[key].durationUnit}</div>
                <div className="mt-2 font-bold">
                  Result: {examples[key].result} workers
                  {examples[key].calculatedResult &&
                    <span className="text-red-500"> (calculated: {examples[key].calculatedResult})</span>
                  }
                </div>
              </div>
              <div className="mt-3 text-center">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadExample(key);
                  }}
                >
                  Load this example
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average number of incidents
              <span className="ml-1 text-xs text-gray-500">({inputs.timePeriod})</span>
            </label>
            <input
              type="number"
              name="incidents"
              value={inputs.incidents}
              onChange={handleInputChange}
              min="0"
              step="1"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage of incidents that trigger playbooks (%)
            </label>
            <input
              type="number"
              name="autoPercent"
              value={inputs.autoPercent}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="1"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average analyst-triggered playbooks
              <span className="ml-1 text-xs text-gray-500">({inputs.timePeriod})</span>
            </label>
            <input
              type="number"
              name="manual"
              value={inputs.manual}
              onChange={handleInputChange}
              min="0"
              step="1"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average playbook duration
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="duration"
                value={inputs.duration}
                onChange={handleInputChange}
                min="1"
                step="1"
                className="w-2/3 p-2 border border-gray-300 rounded"
              />
              <select
                name="durationUnit"
                value={inputs.durationUnit}
                onChange={handleSelectChange}
                className="w-1/3 p-2 border border-gray-300 rounded"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time period for your incident rate
            </label>
            <select
              name="timePeriod"
              value={inputs.timePeriod}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="per hour">Per hour</option>
              <option value="per day">Per day</option>
              <option value="per week">Per week</option>
              <option value="per month">Per month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-center text-blue-800 mb-4">Recommended Number of Playbook Workers</h2>

        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600 my-4">{result.workerCount}</div>

          {result.isOverLimit && (
            <div className="bg-red-100 border-2 border-dashed border-red-400 rounded-md p-4 my-4 text-red-700 font-bold">
              Warning: Your configuration requires {result.calculatedCount} workers, but this solution has a maximum limit of 10 workers. Consider reducing your workload or optimizing your playbooks.
            </div>
          )}
        </div>

        <div className="mt-6 bg-white p-4 rounded-md">
          <h3 className="font-bold mb-2">Calculation Breakdown:</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Auto-triggered playbooks:</strong> {inputs.incidents} incidents × {inputs.autoPercent}% = {result.autoTriggered.toFixed(2)} playbooks</div>
            <div><strong>Total playbooks:</strong> {result.autoTriggered.toFixed(2)} auto + {inputs.manual} manual = {result.totalPlaybooks.toFixed(2)} playbooks {inputs.timePeriod}</div>
            <div><strong>Duration conversion:</strong> {inputs.duration} {inputs.durationUnit} = {result.normalizedDuration.toFixed(6)} {getTimeUnitText()}</div>
            <div><strong>Concurrent playbooks calculation:</strong> {result.totalPlaybooks.toFixed(2)} playbooks × {result.normalizedDuration.toFixed(6)} = {result.withDuration.toFixed(6)} concurrent playbooks</div>

            {result.isOverLimit ? (
              <>
                <div><strong>Calculated workers needed:</strong> {result.calculatedCount} (exceeded maximum)</div>
                <div><strong>Final result (capped at maximum):</strong> {result.workerCount} playbook workers</div>
              </>
            ) : (
              <div><strong>Final result (rounded up):</strong> {result.workerCount} playbook workers needed</div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-100 p-4 rounded-md text-sm font-mono">
          <h3 className="font-bold mb-2">Formula Used:</h3>
          <div>W = [(I × A%) + M] × D</div>
          <div className="mt-2">Where:</div>
          <ul className="list-disc pl-5 mt-1">
            <li>W = Number of playbook workers</li>
            <li>I = Average number of incidents</li>
            <li>A% = Percentage of incidents triggering playbooks</li>
            <li>M = Manually triggered playbooks</li>
            <li>D = Average playbook duration (converted to appropriate time unit)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaybookCalculator;