import numpy as np

class LGBWrapper:
    def __init__(self, model, classes):
        self.model = model
        self.classes = classes

    def predict(self, X):
        y_prob = self.model.predict(X)
        y_pred = np.argmax(y_prob, axis=1)
        return [self.classes[i] for i in y_pred]

    def predict_proba(self, X):
        return self.model.predict(X)
