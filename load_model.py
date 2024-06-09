import joblib
import sys
import json
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import string
from nltk.stem.porter import PorterStemmer
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
ps = PorterStemmer()

# for load model
try:
    model = joblib.load('model_emailspam.pkl')
except FileNotFoundError:
    print("Error: Model file 'model.pkl' not found.")
    sys.exit(1)
except Exception as e:
    print("Error:", e)
    sys.exit(1)


# for load vectorizer
try:
    tfidf = joblib.load('vectorizer_emailspam.pkl')
except FileNotFoundError:
    print("Error: Model file 'vectorizer_emailspam.pkl' not found.")
    sys.exit(1)
except Exception as e:
    print("Error:", e)
    sys.exit(1)

input_data = json.loads(sys.argv[1])

def transform_text(text):
    text = text.lower()
    text = nltk.word_tokenize(text)

    y = []
    for i in text:
        if i.isalnum():
            y.append(i)

    text = y[:]
    y.clear()

    for i in text:
        if i not in stopwords.words('english') and i not in string.punctuation:
            y.append(i)

    text = y[:]
    y.clear()

    for i in text:
        y.append(ps.stem(i))

    return " ".join(y)

transform_txt = transform_text(input_data)
trans_list_txt = [transform_txt]
answer = tfidf.transform(trans_list_txt).toarray()
answer_list = answer.tolist()

# this is for model predict
predictions = model.predict(answer_list)
print(json.dumps(predictions.tolist()))