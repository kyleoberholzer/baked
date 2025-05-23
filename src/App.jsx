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

  const [totalDoughWeight, setTotalDoughWeight] = useState(2000); // Default 2000g total dough

  // Calculate flour weight based on total dough weight and percentages
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

  const handlePercentageChange = (ingredient, value) => {
    setPercentages((prev) => ({
      ...prev,
      [ingredient]: parseFloat(value) || 0,
    }));
  };

  const handleTotalDoughChange = (e) => {
    setTotalDoughWeight(parseInt(e.target.value) || 0);
  };

  const handleFlourTypeChange = (index, field, value) => {
    const newFlourTypes = [...flourTypes];
    newFlourTypes[index] = {
      ...newFlourTypes[index],
      [field]: field === "percentage" ? parseFloat(value) || 0 : value,
    };
    setFlourTypes(newFlourTypes);
  };

  const addFlourType = () => {
    setFlourTypes([...flourTypes, { name: "New Flour", percentage: 0 }]);
  };

  const removeFlourType = (index) => {
    setFlourTypes(flourTypes.filter((_, i) => i !== index));
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
        <div className="ingredient-row header">
          <span>Ingredient</span>
          <span>Baker's %</span>
          <span>Weight (g)</span>
        </div>

        <div className="flour-section">
          <div className="ingredient-row flour-header">
            <span>Flour Types</span>
            <span>% of Total Flour</span>
            <span>Weight (g)</span>
          </div>

          {flourTypes.map((flour, index) => (
            <div key={index} className="ingredient-row flour-type">
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
              />
              <span>
                {calculateWeight((flour.percentage / 100) * percentages.flour)}g
              </span>
            </div>
          ))}

          <button className="add-flour" onClick={addFlourType}>
            + Add Flour Type
          </button>
        </div>

        <div className="ingredient-row">
          <span>Water</span>
          <input
            type="number"
            value={percentages.water}
            onChange={(e) => handlePercentageChange("water", e.target.value)}
            min="0"
          />
          <span>{calculateWeight(percentages.water)}g</span>
        </div>

        <div className="ingredient-row">
          <span>Salt</span>
          <input
            type="number"
            value={percentages.salt}
            onChange={(e) => handlePercentageChange("salt", e.target.value)}
            min="0"
            step="0.1"
          />
          <span>{calculateWeight(percentages.salt)}g</span>
        </div>

        <div className="ingredient-row">
          <span>Starter</span>
          <input
            type="number"
            value={percentages.starter}
            onChange={(e) => handlePercentageChange("starter", e.target.value)}
            min="0"
          />
          <span>{calculateWeight(percentages.starter)}g</span>
        </div>
      </div>

      <div className="total-weight">
        <h3>Total Dough Weight: {totalDoughWeight}g</h3>
      </div>
    </div>
  );
}

export default App;
