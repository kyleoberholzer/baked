import { useState } from "react";
import "./App.css";

function App() {
  const [percentages, setPercentages] = useState({
    flour: 100,
    water: 75,
    salt: 2,
    starter: 20,
  });

  const [flourTypes, setFlourTypes] = useState([
    { name: "Bread Flour", percentage: 100 },
  ]);

  const [starterHydration, setStarterHydration] = useState(100); // Default 100% hydration starter

  const [starterRatio, setStarterRatio] = useState({
    starter: 1,
    flour: 1,
    water: 1,
  });

  const [manualStarterWeight, setManualStarterWeight] = useState(null);
  const [starterAutoFill, setStarterAutoFill] = useState(true);

  const [totalDoughWeight, setTotalDoughWeight] = useState(2000); // Default 2000g total dough

  // Calculate flour weight based on total dough weight and percentages (this is the base calculation)
  const calculateFlourWeight = () => {
    const totalPercentage =
      percentages.flour +
      percentages.water +
      percentages.salt +
      percentages.starter;
    return Math.round((totalDoughWeight * 100) / totalPercentage);
  };

  const calculateWeight = (percentage) => {
    return Math.round((percentage / 100) * calculateFlourWeight());
  };

  // Calculate the actual flour content in starter (solving for total flour dependency)
  const getStarterFlourContent = () => {
    const directFlourWeight = calculateWeight(percentages.flour);
    const starterPercentage = percentages.starter;
    const hydration = starterHydration;

    // More stable mathematical solution:
    // Let TF = total flour, DF = direct flour, SF = starter flour
    // TF = DF + SF
    // Starter weight = (starterPercentage/100) * TF
    // SF = Starter weight / (1 + hydration/100)
    //
    // Substituting: SF = (starterPercentage/100) * (DF + SF) / (1 + hydration/100)
    // Solving: SF = (starterPercentage/100) * DF / ((1 + hydration/100) - (starterPercentage/100))

    if (starterPercentage === 0 || hydration < 0) return 0;

    const starterMultiplier = starterPercentage / 100;
    const hydrationMultiplier = 1 + hydration / 100;
    const denominator = hydrationMultiplier - starterMultiplier;

    // Prevent unstable calculations
    if (denominator <= 0.01) return 0; // More conservative threshold

    const starterFlour = (starterMultiplier * directFlourWeight) / denominator;
    return Math.max(0, Math.round(starterFlour));
  };

  // Calculate water content in starter based on starter hydration
  const getStarterWaterContent = () => {
    const starterFlour = getStarterFlourContent();
    const starterWater = starterFlour * (starterHydration / 100);
    return Math.round(starterWater);
  };

  // Calculate total starter weight
  const getTotalStarterWeight = () => {
    const starterFlour = getStarterFlourContent();
    const starterWater = getStarterWaterContent();
    return starterFlour + starterWater;
  };

  // Calculate the actual total flour weight (direct flour + flour from starter)
  const getTotalFlourWeight = () => {
    const directFlourWeight = calculateWeight(percentages.flour);
    const starterFlourWeight = getStarterFlourContent();
    return directFlourWeight + starterFlourWeight;
  };

  // Calculate ingredient weights based on baker's percentages (relative to total flour weight)
  const calculateBakersWeight = (percentage) => {
    const totalFlourWeight = getTotalFlourWeight();
    return Math.round((percentage / 100) * totalFlourWeight);
  };

  const handlePercentageChange = (ingredient, value) => {
    setPercentages((prev) => ({
      ...prev,
      [ingredient]: value === "" ? 0 : parseFloat(value) || 0,
    }));
  };

  const handleTotalDoughChange = (e) => {
    const value = e.target.value;
    setTotalDoughWeight(value === "" ? 0 : parseInt(value) || 0);
  };

  const handleFlourTypeChange = (index, field, value) => {
    const newFlourTypes = [...flourTypes];

    if (field === "name") {
      newFlourTypes[index] = {
        ...newFlourTypes[index],
        [field]: value,
      };
      setFlourTypes(newFlourTypes);
      return;
    }

    if (field === "percentage") {
      // Clean the input - remove commas and convert to number
      const cleanValue = value.replace(/,/g, "");
      const newPercentage =
        cleanValue === ""
          ? 0
          : Math.max(0, Math.min(100, parseFloat(cleanValue) || 0));

      // Update the changed flour type
      newFlourTypes[index] = {
        ...newFlourTypes[index],
        percentage: newPercentage,
      };

      // Calculate what percentage is left for other flour types
      const remainingPercentage = 100 - newPercentage;

      // Get indices of other flour types (not the one being changed)
      const otherIndices = newFlourTypes
        .map((_, i) => i)
        .filter((i) => i !== index);

      if (otherIndices.length > 0) {
        // Get current total of other flour types FROM THE UPDATED ARRAY
        const currentOtherTotal = otherIndices.reduce(
          (sum, i) => sum + newFlourTypes[i].percentage,
          0
        );

        // Distribute the remaining percentage proportionally among other flour types
        otherIndices.forEach((otherIndex) => {
          if (currentOtherTotal > 0) {
            // Distribute proportionally based on current values
            const currentValue = newFlourTypes[otherIndex].percentage;
            newFlourTypes[otherIndex].percentage =
              Math.round(
                (currentValue / currentOtherTotal) * remainingPercentage * 10
              ) / 10;
          } else {
            // If all others are 0, distribute equally
            newFlourTypes[otherIndex].percentage =
              Math.round((remainingPercentage / otherIndices.length) * 10) / 10;
          }
        });
      }

      setFlourTypes(newFlourTypes);
    }
  };

  const addFlourType = () => {
    // When adding a new flour type, deduct from the first (base) flour only
    const newFlourTypes = [...flourTypes];
    const newFlourPercentage = 20; // Default percentage for new flour

    if (newFlourTypes.length > 0) {
      // Reduce the first flour by the new flour percentage
      const baseFlour = newFlourTypes[0];
      const newBasePercentage = Math.max(
        0,
        baseFlour.percentage - newFlourPercentage
      );

      newFlourTypes[0] = {
        ...baseFlour,
        percentage: newBasePercentage,
      };

      // Add the new flour type
      setFlourTypes([
        ...newFlourTypes,
        { name: "New Flour", percentage: newFlourPercentage },
      ]);
    } else {
      setFlourTypes([...flourTypes, { name: "New Flour", percentage: 20 }]);
    }
  };

  const removeFlourType = (index) => {
    if (flourTypes.length <= 1) return; // Don't remove the last flour type

    const removedFlour = flourTypes[index];
    const newFlourTypes = flourTypes.filter((_, i) => i !== index);

    // Add the removed percentage back to the first (base) flour
    if (newFlourTypes.length > 0 && index !== 0) {
      // If we're not removing the base flour, add percentage to base flour
      newFlourTypes[0] = {
        ...newFlourTypes[0],
        percentage: Math.min(
          100,
          newFlourTypes[0].percentage + removedFlour.percentage
        ),
      };
    } else if (index === 0 && newFlourTypes.length > 0) {
      // If we're removing the base flour, make the next flour the new base
      // and distribute the removed percentage proportionally
      const totalOtherPercentage = newFlourTypes.reduce(
        (sum, flour) => sum + flour.percentage,
        0
      );
      const remainingPercentage = 100 - totalOtherPercentage;

      if (remainingPercentage > 0) {
        newFlourTypes[0] = {
          ...newFlourTypes[0],
          percentage: Math.min(
            100,
            newFlourTypes[0].percentage + remainingPercentage
          ),
        };
      }
    }

    setFlourTypes(newFlourTypes);
  };

  // Calculate total water content (direct water + starter water)
  const getTotalWaterContent = () => {
    const directWater = calculateBakersWeight(percentages.water);
    const starterWater = getStarterWaterContent();
    return directWater + starterWater;
  };

  // Calculate starter build quantities based on ratio
  const getStarterBuildQuantities = () => {
    // Use manual weight if set and auto-fill is disabled, otherwise use calculated weight
    const totalNeeded =
      manualStarterWeight !== null && !starterAutoFill
        ? manualStarterWeight
        : getTotalStarterWeight();
    const totalRatio =
      starterRatio.starter + starterRatio.flour + starterRatio.water;

    if (totalRatio === 0) return { starter: 0, flour: 0, water: 0 };

    const starterAmount = Math.round(
      (starterRatio.starter / totalRatio) * totalNeeded
    );
    const flourAmount = Math.round(
      (starterRatio.flour / totalRatio) * totalNeeded
    );
    const waterAmount = Math.round(
      (starterRatio.water / totalRatio) * totalNeeded
    );

    return {
      starter: starterAmount,
      flour: flourAmount,
      water: waterAmount,
    };
  };

  // Get the effective starter weight for display (manual or calculated)
  const getEffectiveStarterWeight = () => {
    return manualStarterWeight !== null && !starterAutoFill
      ? manualStarterWeight
      : getTotalStarterWeight();
  };

  const handleStarterRatioChange = (ingredient, value) => {
    setStarterRatio((prev) => ({
      ...prev,
      [ingredient]: value === "" ? 0 : parseInt(value) || 0,
    }));
  };

  const handleManualStarterWeightChange = (e) => {
    const value = e.target.value;
    setManualStarterWeight(value === "" ? null : parseInt(value) || 0);
    // Disable auto-fill when user starts typing manually
    if (!starterAutoFill && value !== "") {
      // Already disabled, just update the value
      return;
    }
    if (value !== "") {
      setStarterAutoFill(false);
    }
  };

  const enableStarterAutoFill = () => {
    setStarterAutoFill(true);
    setManualStarterWeight(null);
  };

  // Calculate the actual total of all ingredients
  const getCalculatedTotalWeight = () => {
    const flourWeight = calculateWeight(percentages.flour);
    const directWaterWeight = getDirectWaterNeeded();
    const starterWeight = getTotalStarterWeight();
    const saltWeight = calculateBakersWeight(percentages.salt);

    return flourWeight + directWaterWeight + starterWeight + saltWeight;
  };

  // Calculate direct water needed using the formula: water = total_flour * bread.hydration / 100 - levain_water
  const getDirectWaterNeeded = () => {
    const totalFlour = getTotalFlourWeight();
    const breadHydration = percentages.water;
    const levainWater = getStarterWaterContent();

    const water = (totalFlour * breadHydration) / 100 - levainWater;
    return Math.max(0, Math.round(water));
  };

  return (
    <div className="calculator-container">
      <h1>Sourdough Recipe Calculator</h1>

      <div className="input-group">
        <label>
          Total Dough Weight (g):
          <input
            type="number"
            value={totalDoughWeight}
            onChange={handleTotalDoughChange}
            min="0"
          />
        </label>
      </div>

      <div className="ingredients-grid">
        <div className="flour-section">
          <div className="ingredient-row flour-header">
            <span>Flour Types</span>
            <span>% of Total Flour</span>
            <span>Total: {calculateWeight(percentages.flour)}g</span>
          </div>

          {flourTypes.map((flour, index) => (
            <div
              key={index}
              className="ingredient-row flour-type mixing-ingredient"
            >
              <div className="flour-name-input">
                <input
                  type="text"
                  value={flour.name}
                  onChange={(e) =>
                    handleFlourTypeChange(index, "name", e.target.value)
                  }
                  placeholder="Flour Type"
                />
                {flourTypes.length > 1 && (
                  <button
                    className="remove-flour"
                    onClick={() => removeFlourType(index)}
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                type="number"
                value={flour.percentage}
                onChange={(e) =>
                  handleFlourTypeChange(index, "percentage", e.target.value)
                }
                min="0"
                max="100"
                step="0.1"
                inputMode="decimal"
              />
              <span>
                {calculateWeight((flour.percentage / 100) * percentages.flour)}g
              </span>
            </div>
          ))}

          <div className="flour-total">
            <span>
              Total:{" "}
              {Math.round(
                flourTypes.reduce((sum, flour) => sum + flour.percentage, 0) *
                  10
              ) / 10}
              %
            </span>
          </div>

          <button className="add-flour" onClick={addFlourType}>
            + Add Flour Type
          </button>
        </div>

        <div className="water-section">
          <div className="ingredient-row water-header">
            <span>Water</span>
            <input
              type="number"
              value={percentages.water}
              onChange={(e) => handlePercentageChange("water", e.target.value)}
              min="0"
            />
            <span>Total: {calculateBakersWeight(percentages.water)}g</span>
          </div>

          <div className="ingredient-row water-breakdown mixing-ingredient">
            <span>Direct Water</span>
            <span>-</span>
            <span>{getDirectWaterNeeded()}g</span>
          </div>

          <div className="ingredient-row water-breakdown">
            <span>Water from Starter</span>
            <span>-</span>
            <span>{getStarterWaterContent()}g</span>
          </div>
        </div>

        <div className="starter-section">
          <div className="ingredient-row starter-header">
            <span>Starter</span>
            <span>Baker's %</span>
            <span>Total: {getTotalStarterWeight()}g</span>
          </div>

          <div className="ingredient-row mixing-ingredient">
            <span>Starter Amount</span>
            <input
              type="number"
              value={percentages.starter}
              onChange={(e) =>
                handlePercentageChange("starter", e.target.value)
              }
              min="0"
            />
            <span>{getTotalStarterWeight()}g</span>
          </div>

          <div className="ingredient-row starter-hydration">
            <span>Starter Hydration</span>
            <input
              type="number"
              value={starterHydration}
              onChange={(e) => {
                const value = e.target.value;
                setStarterHydration(value === "" ? 0 : parseFloat(value) || 0);
              }}
              min="0"
              max="200"
              step="1"
            />
            <span>{getStarterWaterContent()}g water</span>
          </div>

          <div className="ingredient-row water-breakdown">
            <span>Starter Flour</span>
            <span>-</span>
            <span>{getStarterFlourContent()}g</span>
          </div>
        </div>

        <div className="ingredient-row mixing-ingredient">
          <span>Salt</span>
          <input
            type="number"
            value={percentages.salt}
            onChange={(e) => handlePercentageChange("salt", e.target.value)}
            min="0"
            step="0.1"
          />
          <span>{calculateBakersWeight(percentages.salt)}g</span>
        </div>
      </div>

      <div className="total-weight">
        <h3>
          Target: {totalDoughWeight}g | Calculated: {getCalculatedTotalWeight()}
          g
        </h3>
      </div>

      <div className="starter-calc-title">
        <h2>Starter Build Calculator</h2>
        <p>
          Calculate ingredients needed to build your starter the day before
          baking
        </p>
      </div>

      <div className="input-group">
        <label>
          Total Starter Needed (g):
          <input
            type="number"
            value={
              starterAutoFill
                ? getTotalStarterWeight()
                : manualStarterWeight !== null
                ? manualStarterWeight
                : ""
            }
            onChange={handleManualStarterWeightChange}
            placeholder={`Auto: ${getTotalStarterWeight()}g`}
            min="0"
          />
        </label>
        <div className="auto-fill-message">
          {starterAutoFill ? (
            <p>Autofilled from dough recipe</p>
          ) : (
            <>
              <p>Auto calculation off</p>
              <button
                onClick={enableStarterAutoFill}
                className="auto-fill-button"
              >
                Click to autofill again
              </button>
            </>
          )}
        </div>
      </div>

      <div className="starter-calculator-section">
        <div className="ingredient-row starter-calc-header">
          <span>Starter Calculator</span>
          <span>Ratio</span>
          <span>Build: {getEffectiveStarterWeight()}g</span>
        </div>

        <div className="ingredient-row mixing-ingredient">
          <span>Existing Starter</span>
          <input
            type="number"
            value={starterRatio.starter}
            onChange={(e) =>
              handleStarterRatioChange("starter", e.target.value)
            }
            min="0"
          />
          <span>{getStarterBuildQuantities().starter}g</span>
        </div>

        <div className="ingredient-row mixing-ingredient">
          <span>Fresh Flour</span>
          <input
            type="number"
            value={starterRatio.flour}
            onChange={(e) => handleStarterRatioChange("flour", e.target.value)}
            min="0"
          />
          <span>{getStarterBuildQuantities().flour}g</span>
        </div>

        <div className="ingredient-row mixing-ingredient">
          <span>Fresh Water</span>
          <input
            type="number"
            value={starterRatio.water}
            onChange={(e) => handleStarterRatioChange("water", e.target.value)}
            min="0"
          />
          <span>{getStarterBuildQuantities().water}g</span>
        </div>
      </div>
    </div>
  );
}

export default App;
