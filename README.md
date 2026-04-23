Starting:

check if minikube is running:
minikube status.

if stopped:
minikube start

cd infra/k8s
kubectl apply -f postgres-pvc.yaml
kubectl apply -k .     

# brute force reset:

docker build -t tanelpauls/distributed_app_auth ./auth
docker push tanelpauls/distributed_app_auth
cd infra/k8s/

kubectl delete -k .
kubectl apply -k . 