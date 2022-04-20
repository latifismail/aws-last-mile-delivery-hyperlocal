/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package dev.aws.proto.apps.sameday.directpudo.config;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithName;

/**
 * DynamoDB Config Properties
 */
@ConfigMapping(prefix = "app.ssmparams.ddb")
public interface DdbProperties {
    @WithName("table.delivery-jobs")
    String deliveryJobsTableParameterName();

    @WithName("table.solver-jobs")
    String solverJobsTableParameterName();

    @WithName("table.hubs")
    String hubsTableParameterName();

    @WithName("index.delivery-jobs-solver-job-id")
    String deliveryJobsTableSolverJobIdIndexParameterName();
}
