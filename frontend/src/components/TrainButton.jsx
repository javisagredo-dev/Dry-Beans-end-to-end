export default function TrainButton({ loading, trainDots, onTrain }) {
  return (
    <button
      className={`train-btn ${loading ? 'train-btn--loading' : ''}`}
      onClick={onTrain}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="train-spinner" />
          Entrenando SVM{trainDots}
        </>
      ) : (
        '▶  Ejecutar entrenamiento'
      )}
    </button>
  );
}
