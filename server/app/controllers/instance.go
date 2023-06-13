package controllers

import (
	"context"

	"github.com/cirnum/loadtester/server/app/models"
	"github.com/cirnum/loadtester/server/app/utils"
	"github.com/cirnum/loadtester/server/db"
	"github.com/cirnum/loadtester/server/pkg/constants"
	"github.com/gofiber/fiber/v2"
)

func CreatePemKey(c *fiber.Ctx) error {
	// id := c.Params("id")
	err := utils.CreatePem()

	if err != nil {
		return utils.ResponseError(c, err, err.Error(), fiber.StatusInternalServerError)
	}
	return utils.ResponseSuccess(c, "Done", "Key created successfuly.", fiber.StatusOK)
}

func GetPemKey(c *fiber.Ctx) error {
	// id := c.Params("id")
	err := utils.GetKeyPair()

	if err != nil {
		return utils.ResponseError(c, err, err.Error(), fiber.StatusInternalServerError)
	}
	return utils.ResponseSuccess(c, "Done", "Get keys successfuly.", fiber.StatusOK)
}

func CreateEC2(c *fiber.Ctx) error {
	// id := c.Params("id")
	var ec2Options models.CreateEC2Options
	ctx := context.Background()
	if err := c.BodyParser(&ec2Options); err != nil {
		return utils.ResponseError(c, err, constants.InvalidBody, fiber.StatusInternalServerError)
	}

	allCreatedEc2, err := utils.CreateEC2(ec2Options)
	workerData, err := db.Provider.CreateEC2(ctx, allCreatedEc2)
	go utils.JobScheduler(workerData)
	if err != nil {
		return utils.ResponseError(c, err, err.Error(), fiber.StatusInternalServerError)
	}
	return utils.ResponseSuccess(c, workerData, "EC2 Created successfuly.", fiber.StatusOK)
}

func GetRunningEC2(c *fiber.Ctx) error {
	// id := c.Params("id")
	ctx := context.Background()
	ec2s, err := db.Provider.GetAllEc2s(ctx)
	// ec, err := utils.GetRunningInstance(ec2s)

	if err != nil {
		return utils.ResponseError(c, err, err.Error(), fiber.StatusInternalServerError)
	}
	return utils.ResponseSuccess(c, ec2s, "Get keys successfuly.", fiber.StatusOK)
}

func TerminateEC2(c *fiber.Ctx) error {
	// id := c.Params("id")
	var instanceIdsList models.InstanceIdList
	ctx := context.Background()

	if err := c.BodyParser(&instanceIdsList); err != nil {
		return utils.ResponseError(c, err, constants.InvalidBody, fiber.StatusInternalServerError)
	}

	err := utils.TerminateEC2(instanceIdsList.InstanceIds)
	if err != nil {
		return utils.ResponseError(c, err, err.Error(), fiber.StatusInternalServerError)
	}
	err = db.Provider.UpdateEc2Status(ctx, instanceIdsList.InstanceIds, "terminated", -1)

	if err != nil {
		return utils.ResponseError(c, err, err.Error(), fiber.StatusInternalServerError)
	}
	return utils.ResponseSuccess(c, instanceIdsList, "Instance terminated successfuly.", fiber.StatusOK)
}
