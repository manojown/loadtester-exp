package httpRequest

import (
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"reflect"
	"strings"
	"sync"
	"time"

	"github.com/cirnum/loadtester/server/db/models"
	"github.com/cirnum/loadtester/server/pkg/executor"
	metrics "github.com/cirnum/loadtester/server/pkg/executor/metrics"
)

type HttpClient struct {
	reqId     string
	client    *http.Client
	startTime int64
	title     struct {
		success   string
		fail      string
		otherFail string
		latency   string
	}
}

func Initializer(reqId string) (HttpClient, error) {
	httpClient := HttpClient{}
	httpClient.title.success = ".http_ok"
	httpClient.title.otherFail = ".http_other_fail"
	httpClient.title.fail = ".http_fail"
	httpClient.title.latency = ".latency"
	group := metrics.Group{
		Name: "HTTP (" + reqId + ")",
		Graphs: []metrics.Graph{
			{
				Title: "HTTP Response",
				Unit:  "N",
				Metrics: []metrics.Metric{
					{
						Title: httpClient.title.success,
						Type:  metrics.Counter,
					},
					{
						Title: httpClient.title.fail,
						Type:  metrics.Counter,
					},
					{
						Title: httpClient.title.otherFail,
						Type:  metrics.Counter,
					},
				},
			},
			{
				Title: "Latency",
				Unit:  "Microsecond",
				Metrics: []metrics.Metric{
					{
						Title: httpClient.title.latency,
						Type:  metrics.Histogram,
					},
				},
			},
		},
	}
	groups := []metrics.Group{
		group,
	}
	tr := &http.Transport{
		MaxIdleConnsPerHost: 300,
	}
	httpClient.client = &http.Client{
		Transport: tr,
		Timeout:   time.Second * 10,
	}

	if err := executor.Setup(groups, reqId); err != nil {
		return httpClient, err
	}

	return httpClient, nil
}

func (h *HttpClient) RunScen(ctx context.Context, conf models.Request) {

	finished := make(chan error)
	// timeout := time.After(time.Duration(conf.Time) * time.Second)
	var err error

	go func() {
		select {
		case err = <-finished:
			ctx.Done()
		case <-ctx.Done():
			log.Println("Job Completed")
			return
		}
	}()
	h.Manager(ctx, conf, finished)
	log.Println("Error", err)
}

func (h *HttpClient) Manager(ctx context.Context, conf models.Request, done chan<- error) {
	headers := h.GetRequestHeades(conf.Headers)
	numOfClient := conf.Clients
	var wg sync.WaitGroup
	wg.Add(numOfClient)
	body, _ := json.Marshal(conf.PostData)
	h.startTime = time.Now().Unix()
	go func() {
		for j := 0; j < numOfClient; j++ {
			go func() {
				for {
					select {
					case <-ctx.Done():
						return
					default:
						if conf.Method == "GET" {
							h.Get(ctx, conf.URL, headers)
						} else {
							h.Request(conf.Method, conf.URL, body, headers)
						}
					}
				}
			}()
		}
		wg.Done()
	}()

	wg.Wait()
	done <- nil
}

func (h *HttpClient) Request(verb string, url string, body []byte, headers map[string]string) ([]byte, error) {
	res, err := h.do(verb, url, body, headers)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	buf, err := ioutil.ReadAll(res.Body)

	return buf, err
}

func (h *HttpClient) ignoreRes(verb string, url string, body []byte, headers map[string]string) error {
	res, err := h.do(verb, url, body, headers)
	if err != nil {
		return err
	}

	defer res.Body.Close()
	io.Copy(ioutil.Discard, res.Body)

	return nil
}

func (h *HttpClient) do(method, url string, body []byte, headers map[string]string) (
	res *http.Response, err error,
) {
	begin := time.Now()

	defer func() {
		diff := time.Since(begin)

		executor.Notify(h.title.latency, diff.Microseconds())
		if err != nil {
			executor.Notify(h.title.otherFail, 1)
			return
		}
		if res.StatusCode >= 300 || res.StatusCode < 200 {
			executor.Notify(h.title.fail, 1)
			return
		}
		executor.Notify(h.title.success, 1)
	}()

	req, err := http.NewRequest(method, url, strings.NewReader(string(body)))

	if err != nil {
		return
	}

	// add headers
	for k, v := range headers {
		req.Header.Add(k, v)
	}

	res, err = h.client.Do(req)

	return
}

// Get makes http get request and record the metrics
func (h *HttpClient) Get(ctx context.Context, url string, headers map[string]string) ([]byte, error) {
	return h.Request(http.MethodGet, url, nil, headers)
}

// GetIgnoreRes makes http get request, records the metrics, but ignore the
// responding body. Use this when you need high speed traffic generation
func (h *HttpClient) GetIgnoreRes(ctx context.Context, url string, headers map[string]string) error {
	return h.ignoreRes(http.MethodGet, url, nil, headers)
}

// Post makes http post request and record the metrics
func (h *HttpClient) Post(ctx context.Context, url string, body []byte, headers map[string]string) ([]byte, error) {
	return h.Request(http.MethodPost, url, body, headers)
}

// PostIgnoreRes makes http get request, records the metrics, but ignore the
// responding body. Use this when you need high speed traffic generation
func (h *HttpClient) PostIgnoreRes(ctx context.Context, url string, body []byte, headers map[string]string) error {
	return h.ignoreRes(http.MethodPost, url, body, headers)
}

// Put makes http put request and record the metrics
func (h *HttpClient) Put(ctx context.Context, url string, body []byte, headers map[string]string) ([]byte, error) {
	return h.Request(http.MethodPut, url, body, headers)
}

// Patch makes http patch request and record the metrics
func (h *HttpClient) Patch(ctx context.Context, url string, body []byte, headers map[string]string) ([]byte, error) {
	return h.Request(http.MethodPatch, url, body, headers)
}

func (h *HttpClient) GetRequestHeades(data interface{}) map[string]string {
	headers := make(map[string]string)
	v := reflect.ValueOf(data)
	if v.Kind() == reflect.Map {
		for _, key := range v.MapKeys() {
			headers[key.Interface().(string)] = v.MapIndex(key).Interface().(string)
		}
	}
	return headers
}
