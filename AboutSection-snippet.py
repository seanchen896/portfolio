import numpy as np

data = np.loadtxt("survey.txt")
sample_mean = np.mean(data)

print(sample_mean)