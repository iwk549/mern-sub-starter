function sampleCalculation(values) {
  try {
    const x = (Number(values.oni || 0) + Number(values.i1 || 0)).toFixed(2);
    const unit = values.units === "metric" ? "cm" : "ft";
    return (
      <div>
        Two number inputs added: {x} {unit}
      </div>
    );
  } catch (error) {
    return 0;
  }
}

function sampleCalculation2(values) {
  try {
    const x = (Number(values.oni || 0) - Number(values.i1 || 0)).toFixed(2);
    const unit = values.units === "metric" ? "cm" : "ft";
    return (
      <div>
        First numb input minus second num input: {x} {unit}
      </div>
    );
  } catch (error) {
    return 0;
  }
}

export { sampleCalculation, sampleCalculation2 };
