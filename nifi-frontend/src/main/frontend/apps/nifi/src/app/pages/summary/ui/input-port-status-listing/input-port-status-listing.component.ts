/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from '@angular/core';
import {
    selectInputPortIdFromRoute,
    selectInputPortStatusSnapshots,
    selectSelectedClusterNode,
    selectSummaryListingLoadedTimestamp,
    selectSummaryListingStatus
} from '../../state/summary-listing/summary-listing.selectors';
import { selectCurrentUser } from '../../../../state/current-user/current-user.selectors';
import { SummaryListingState } from '../../state/summary-listing';
import { Store } from '@ngrx/store';
import { initialState } from '../../state/summary-listing/summary-listing.reducer';
import * as SummaryListingActions from '../../state/summary-listing/summary-listing.actions';
import { loadClusterSummary } from '../../../../state/cluster-summary/cluster-summary.actions';
import { PortStatusSnapshotEntity } from '../../state';
import {
    selectClusterSearchResults,
    selectClusterSummary
} from '../../../../state/cluster-summary/cluster-summary.selectors';
import { ComponentType, isDefinedAndNotNull } from '@nifi/shared';
import { map } from 'rxjs';
import { NodeSearchResult } from '../../../../state/cluster-summary';
import * as ClusterStatusActions from '../../state/component-cluster-status/component-cluster-status.actions';

@Component({
    selector: 'input-port-status-listing',
    templateUrl: './input-port-status-listing.component.html',
    styleUrls: ['./input-port-status-listing.component.scss'],
    standalone: false
})
export class InputPortStatusListing {
    portStatusSnapshots$ = this.store.select(selectInputPortStatusSnapshots);
    loadedTimestamp$ = this.store.select(selectSummaryListingLoadedTimestamp);
    summaryListingStatus$ = this.store.select(selectSummaryListingStatus);
    currentUser$ = this.store.select(selectCurrentUser);
    selectedPortId$ = this.store.select(selectInputPortIdFromRoute);
    connectedToCluster$ = this.store.select(selectClusterSummary).pipe(
        isDefinedAndNotNull(),
        map((cluster) => cluster.connectedToCluster)
    );
    clusterNodes$ = this.store.select(selectClusterSearchResults).pipe(
        isDefinedAndNotNull(),
        map((results) => results.nodeResults)
    );
    selectedClusterNode$ = this.store.select(selectSelectedClusterNode);

    constructor(private store: Store<SummaryListingState>) {}

    isInitialLoading(loadedTimestamp: string): boolean {
        return loadedTimestamp == initialState.loadedTimestamp;
    }

    refreshSummaryListing() {
        this.store.dispatch(SummaryListingActions.loadSummaryListing({ recursive: true }));
        this.store.dispatch(loadClusterSummary());
    }

    selectPort(port: PortStatusSnapshotEntity): void {
        this.store.dispatch(
            SummaryListingActions.selectInputPortStatus({
                request: {
                    id: port.id
                }
            })
        );
    }

    clearSelection() {
        this.store.dispatch(SummaryListingActions.clearInputPortStatusSelection());
    }

    clusterNodeSelected(clusterNode: NodeSearchResult) {
        this.store.dispatch(SummaryListingActions.selectClusterNode({ clusterNode }));
    }

    viewClusteredDetails(port: PortStatusSnapshotEntity): void {
        this.store.dispatch(
            ClusterStatusActions.loadComponentClusterStatusAndOpenDialog({
                request: {
                    id: port.id,
                    componentType: ComponentType.InputPort
                }
            })
        );
    }
}
