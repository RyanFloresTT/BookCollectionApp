package middleware

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
)

type JWK struct {
	Keys []struct {
		Kty string `json:"kty"`
		Use string `json:"use"`
		Kid string `json:"kid"`
		N   string `json:"n"`
		E   string `json:"e"`
	} `json:"keys"`
}

func GetSigningKey(jwksURL string, token *jwt.Token) (*rsa.PublicKey, error) {
	// Fetch JWKS
	resp, err := http.Get(jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read JWKS response: %v", err)
	}

	var jwks JWK
	err = json.Unmarshal(body, &jwks)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JWKS: %v", err)
	}

	// Match the token's "kid" to find the correct public key
	kid := token.Header["kid"].(string)
	for _, key := range jwks.Keys {
		if key.Kid == kid {
			// Decode the base64url-encoded N and E values
			nBytes, err := base64.RawURLEncoding.DecodeString(key.N)
			if err != nil {
				return nil, fmt.Errorf("failed to decode modulus (N): %v", err)
			}
			eBytes, err := base64.RawURLEncoding.DecodeString(key.E)
			if err != nil {
				return nil, fmt.Errorf("failed to decode exponent (E): %v", err)
			}

			// Convert to rsa.PublicKey
			n := new(big.Int).SetBytes(nBytes)
			e := int(new(big.Int).SetBytes(eBytes).Uint64())
			pubKey := &rsa.PublicKey{N: n, E: e}
			return pubKey, nil
		}
	}

	return nil, fmt.Errorf("unable to find matching key")
}
